import { Secret } from '@c6o/kubeclient-resources/core/v1'
import { baseProvisionerType } from '../'
import { Buffer } from 'buffer'
import * as mariadb from 'mariadb'
import createDebug from 'debug'
import { processPassword } from '@provisioner/common'

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
        await this.ensureMariadbIsInstalled()
        await this.ensureMariadbIsRunning()
        await this.ensureMariadbIsProvisioned()
    }

    /** Looks for mariadb pods and if none are found, applies the appropriate yaml */
    async ensureMariadbIsInstalled() {

        await this.controller.cluster
            .begin('Install mariadb services')
            .list(this.mariadbPods)
            .do((result, processor) => {
                if (result?.object?.items?.length == 0) {
                    // There are no mariadb-db pods

                    this.plainRootPassword = processPassword(this.spec.rootPassword)
                    this.plainRootPasswordForInitialization = this.plainRootPassword
                    this.encodedRootPassword = Buffer.from(this.plainRootPassword).toString('base64')

                    const namespace = this.serviceNamespace
                    const storageClass = this.spec.storageClass
                    const rootPasswordKey = this.spec.rootPasswordKey || 'password'

                    // Install mariadb
                    processor
                        .mergeWith(this.documentHelper.appComponentMergeDocument)
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
        await this.controller.cluster.
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
            this.controller.status?.push('Setting up mariadb databases')
            this.controller.status?.pop(true)
            return
        }

        await this.controller.cluster
            .begin('Setting up mariadb databases')
            .beginForward(3306, this.runningPod)
            .attempt(10, 5000, async (processor, attempt) => await this.connectMariadbClient(processor, attempt))
            .do(async (_, processor) => await this.provisionMariadb(processor))
            .do(async _ => await this.disconnectMariadbClient())
            .endForward()
            .end()
    }

    //read the root password from the cluster secret, result is a decoded value
    async ensureRootPassword() {

        if (this.plainRootPasswordForInitialization) return

        const result = await this.controller.cluster.read(this.rootSecret)
        result.throwIfError('Failed to load rootSecret')
        const secret = result.as<Secret>()

        const keys = Object.keys(secret.data)

        if (keys?.length !== 1)
            throw new Error('Failed to load rootSecret')

        this.plainRootPasswordForInitialization = Buffer.from(secret.data[keys[0]], 'base64').toString()
    }

    /** Attempts to connect to mariadb and sets the mariadbClient */
    async connectMariadbClient(processor, attempt) {

        this.ensureRootPassword()

        this.controller.status?.info(`Attempt ${attempt + 1} to connect to mariadb on local port ${processor.lastResult.other.localPort}`)
        const connectionArgs =
        {
            host: '127.0.0.1',
            port: processor.lastResult.other.localPort,
            user: 'root',
            password: this.plainRootPasswordForInitialization
        }
        this.connection = await mariadb.createConnection(connectionArgs)
        //await this.connection.connect()
        return true

    }

    /** Closes the mariadbClient connection */
    async disconnectMariadbClient() {
        this.controller.status?.info('Closing connection to mariadb')
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
        const password = processPassword(config.password)
        const host = `${this.mariadbServiceName}.${this.serviceNamespace}.svc.cluster.local`
        const port = 3306
        const connectionString = this.toConnectionString({ username, password, host, port, database: dbName })

        if (process.env.NODE_ENV === 'development')
            this.controller.status?.info(`Connection string ${connectionString}`)


        try {
            this.controller.status?.push(`Creating database ${dbName}`)
            await this.connection.query(`CREATE DATABASE IF NOT EXISTS ${dbName}`)
        }
        finally {
            this.controller.status?.pop()
        }

        try {
            this.controller.status?.push(`Setting up database user ${username}`)
            await this.connection.query(`CREATE USER IF NOT EXISTS '${username}'@'%' IDENTIFIED BY '${password}';`)
            await this.connection.query(`GRANT ALL PRIVILEGES ON ${dbName}.* TO '${username}'@'%';`)
            await this.connection.query('FLUSH PRIVILEGES;')
        }
        finally {
            this.controller.status?.pop()
        }

        try {
            this.controller.status?.push('Writing database connection data to the Secrets')
            if (config.connectionStringSecretKey) this.configMap[config.connectionStringSecretKey] = Buffer.from(connectionString).toString('base64')
            if (config.usernameSecretKey) this.configMap[config.usernameSecretKey] = Buffer.from(username).toString('base64')
            if (config.passwordSecretKey) this.configMap[config.passwordSecretKey] = Buffer.from(password).toString('base64')
            if (config.rootUsernameSecretKey) this.configMap[config.rootUsernameSecretKey] = Buffer.from('root').toString('base64')
            if (config.rootPasswordSecretKey) this.configMap[config.rootPasswordSecretKey] = this.encodedRootPassword
            if (config.hostSecretKey) this.configMap[config.hostSecretKey] = Buffer.from(host).toString('base64')
            if (config.portSecretKey) this.configMap[config.portSecretKey] = Buffer.from(port.toString()).toString('base64')
            if (config.databaseSecretKey) this.configMap[config.databaseSecretKey] = Buffer.from(dbName).toString('base64')
            if (config.databaseTypeSecretKey) this.configMap[config.databaseTypeSecretKey] = Buffer.from('mariadb').toString('base64')
        }
        finally {
            this.controller.status?.pop()
        }

    }
}