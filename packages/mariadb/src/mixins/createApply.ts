import { baseProvisionerType } from '../'
import { Buffer } from 'buffer'
import * as mariadb from 'mariadb'
import createDebug from 'debug'
const debug = createDebug('mariadb:createApply')
export const createApplyMixin = (base: baseProvisionerType) => class extends base {

    // protected members
    runningPod
    plainRootPassword
    plainRootPasswordForInitialization
    encodedRootPassword
    connection
    configMap
    namespace

    mariadbServiceName = 'mariadb'
    get mariadbPods() {
        return {
            kind: 'Pod',
            metadata: {
                namespace: this.serviceNamespace,
                labels: {
                    name: 'mariadb'
                }
            }
        }
    }

    get rootSecret() {
        return {
            kind: 'Secret',
            metadata: {
                namespace: this.serviceNamespace,
                name: 'mariadb-root'
            }
        }
    }

    async createApply() {
        await this.ensureServiceNamespacesExist()
        await this.ensureMariadbIsInstalled()
        await this.ensureMariadbIsRunning()
        await this.ensureMariadbIsProvisioned()
    }

    /** Looks for mariadb pods and if none are found, applies the appropriate yaml */
    async ensureMariadbIsInstalled() {

        await this.manager.cluster
            .begin('Install mariadb services')
            .list(this.mariadbPods)
            .do((result, processor) => {
                if (result?.object?.items?.length == 0) {
                    // There are no mariadb-db pods

                    this.plainRootPassword = super.processPassword(this.spec.rootPassword)
                    this.plainRootPasswordForInitialization = this.plainRootPassword
                    this.encodedRootPassword = Buffer.from(this.plainRootPassword).toString('base64')
                    const namespace = this.serviceNamespace
                    const storageClass = this.spec.storageClass
                    const rootPasswordKey = this.spec.rootPasswordKey || 'password'
                    // Install mariadb
                    processor
                        .mergeWith(super.documentHelper.appComponentMergeDocument)
                        .upsertFile('../../k8s/pvc.yaml', { namespace, storageClass })
                        .upsertFile('../../k8s/service.yaml', { namespace })
                        .upsertFile('../../k8s/root-secret.yaml', { namespace, rootPasswordKey, rootPassword: this.encodedRootPassword })
                        .upsertFile('../../k8s/deployment.yaml', { namespace, rootPassword: this.plainRootPassword, rootPasswordKey })
                }
            })
            .end()
    }

    /** Watches pods and ensures that a pod is running and sets runningPod */
    async ensureMariadbIsRunning() {
        await this.manager.cluster.
            begin('Ensure mariadb services are running')
            .beginWatch(this.mariadbPods)
            .whenWatch(({ condition }) => condition.Ready == 'True', (processor, pod) => {
                this.runningPod = pod
                processor.endWatch()
            })
            .end()
    }

    /** Port forwards and connects to the mariadb and initiates a provision */
    async ensureMariadbIsProvisioned() {
        if (!this.hasDatabasesToConfigure) {
            this.manager.status?.push('Setting up mariadb databases')
            this.manager.status?.pop(true)
            return
        }

        await this.manager.cluster
            .begin('Setting up mariadb databases')
            .beginForward(3306, this.runningPod)
            .attempt(10, 5000, async (processor, attempt) => this.connectMariadbClient(processor, attempt))
            .do(async (_, processor) => await this.provisionMariadb(processor))
            .do(async _ => await this.disconnectMariadbClient())
            .endForward()
            .end()
    }

    //read the root password from the cluster secret, result is a decoded value
    async ensureRootPassword() {

        if (this.plainRootPasswordForInitialization) return

        const result = await this.manager.cluster.read(this.rootSecret)

        if (!result.object) throw new Error('Failed to load rootSecret')

        const keys = Object.keys(result.object.data)

        if (keys?.length !== 1)
            throw new Error('Failed to load rootSecret')

        this.plainRootPasswordForInitialization = Buffer.from(result.object.data[keys[0]], 'base64').toString()
    }

    /** Attempts to connect to mariadb and sets the mariadbClient */
    connectMariadbClient(processor, attempt) {

        this.ensureRootPassword()

        this.manager.status?.info(`Attempt ${attempt + 1} to connect to mariadb on local port ${processor.lastResult.other.localPort}`)
        const connectionArgs =
        {
            host: '127.0.0.1',
            port: processor.lastResult.other.localPort,
            user: 'root',
            password: this.plainRootPasswordForInitialization,
            database: 'mariadb'
        }
        this.connection = mariadb.createConnection(connectionArgs)
        this.connection.connect()
        return true

    }

    /** Closes the mariadbClient connection */
    async disconnectMariadbClient() {
        this.manager.status?.info('Closing connection to mariadb')
        //https://github.com/mariadbjs/mariadb/blob/master/Readme.md#terminating-connections
        //this.connection.destroy()

        //intentionally ignoring the error
        //without the func arg it will throw and break the install
        await this.connection.end(e => { return })
    }

    /**
     * Goes through all the configurations in the specs and calls setupDb
     * then upserts the configMap of connection strings in the secretKeyRef Secret
     */
    async provisionMariadb(processor) {
        this.configMap = {}

        for (const dbConfig of this.spec.config)
            await this.setupDb(dbConfig)

        if (Object.keys(this.configMap).length) {
            // We have some secrets to add
            const configMapSecret = {
                kind: 'Secret',
                metadata: {
                    namespace: this.serviceNamespace,
                    name: this.spec.secretKeyRef
                },
                data: this.configMap
            }

            processor
                .upsert(configMapSecret)
        }
    }
    toConnectionString = (options) =>
        `Server=${options.host}; Port=${options.port || 3306}; Uid=${options.username}; Pwd=${options.password}; Database=${options.database}`

    /**
     * Creates a the database based on the dbConfig and adds the connection string to configMap
     * @param cluster
     * @param dbConfig
     */
    async setupDb(dbConfig) {
        const dbName = Object.keys(dbConfig)[0]
        const config = dbConfig[dbName]
        const username = config.user || 'devUser'
        const password = super.processPassword(config.password)
        const host = `${this.mariadbServiceName}.${this.serviceNamespace}.svc.cluster.local`
        const port = 3306
        const connectionString = this.toConnectionString({ username, password, host, port, database: dbName })
        if (process.env.NODE_ENV == 'development')
            this.manager.status?.info(`Connection string ${connectionString}`)


        try {
            this.manager.status?.push(`Creating database ${dbName}`)
            await this.connection.query(`CREATE DATABASE IF NOT EXISTS ${dbName}`)
        } finally {
            this.manager.status?.pop()
        }

        try {
            this.manager.status?.push(`Setting up database user ${username}`)
            await this.connection.query(`CREATE USER IF NOT EXISTS ${username}@'%' IDENTIFIED BY ${mariadb.escape(password)};`)
            await this.connection.query(`ALTER USER IF EXISTS ${username}@'%' IDENTIFIED WITH mariadb_native_password BY ${mariadb.escape(password)};`)
            await this.connection.query(`GRANT ALL PRIVILEGES ON  ${dbName}.* TO ${username}@'%';`)
            await this.connection.query('FLUSH PRIVILEGES;')
        } finally {
            this.manager.status?.pop()
        }

        try {
            this.manager.status?.push('Writing database connection data to the Secrets')
            if (config.connectionStringSecretKey) this.configMap[config.connectionStringSecretKey] = Buffer.from(connectionString).toString('base64')
            if (config.usernameSecretKey) this.configMap[config.usernameSecretKey] = Buffer.from(username).toString('base64')
            if (config.passwordSecretKey) this.configMap[config.passwordSecretKey] = Buffer.from(password).toString('base64')
            if (config.hostSecretKey) this.configMap[config.hostSecretKey] = Buffer.from(host).toString('base64')
            if (config.portSecretKey) this.configMap[config.portSecretKey] = Buffer.from(port.toString()).toString('base64')
            if (config.databaseSecretKey) this.configMap[config.databaseSecretKey] = Buffer.from(dbName).toString('base64')
            if (config.databaseTypeSecretKey) this.configMap[config.databaseTypeSecretKey] = Buffer.from('mariadb').toString('base64')
        } finally {
            this.manager.status?.pop()
        }

    }
}