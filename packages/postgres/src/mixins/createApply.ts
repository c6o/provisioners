import { processPassword } from '@provisioner/common'
import { Secret } from '@c6o/kubeclient-resources/core/v1'
import { baseProvisionerType } from '../'
import { Buffer } from 'buffer'
import { Client } from 'pg'
import createDebug from 'debug'

const debug = createDebug('postgres:createApply')
export const createApplyMixin = (base: baseProvisionerType) => class extends base {

    // protected members
    runningPod
    plainRootPassword
    plainRootPasswordForInitialization
    encodedRootPassword
    connection
    configMap
    namespace
    rootUserName = 'postgres'

    postgresServiceName = 'postgres'
    get postgresPods() {
        return {
            kind: 'Pod',
            metadata: {
                namespace: this.serviceNamespace,
                labels: {
                    name: 'postgres'
                }
            }
        }
    }

    get rootSecret() {
        return {
            kind: 'Secret',
            metadata: {
                namespace: this.serviceNamespace,
                name: 'postgres-root'
            }
        }
    }

    async createApply() {
        await this.ensureServiceNamespacesExist()
        await this.ensurepostgresIsInstalled()
        await this.ensurepostgresIsRunning()
        await this.ensurepostgresIsProvisioned()
    }

    /** Looks for postgres pods and if none are found, applies the appropriate yaml */
    async ensurepostgresIsInstalled() {

        await this.cluster
            .begin('Install postgres services')
            .list(this.postgresPods)
            .do((result, processor) => {
                if (result?.object?.items?.length == 0) {
                    // There are no postgres-db pods

                    this.plainRootPassword = processPassword(this.spec.rootPassword)
                    this.plainRootPasswordForInitialization = this.plainRootPassword
                    this.encodedRootPassword = Buffer.from(this.plainRootPassword).toString('base64')
                    const namespace = this.serviceNamespace
                    const storageClass = this.spec.storageClass
                    const rootPasswordKey = this.spec.rootPasswordKey || 'password'
                    // Install postgres
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
    async ensurepostgresIsRunning() {
        await this.cluster.
            begin('Ensure postgres services are running')
            .beginWatch(this.postgresPods)
            .whenWatch(({ condition }) => condition.Ready == 'True', (processor, pod) => {
                this.runningPod = pod
                processor.endWatch()
            })
            .end()
    }

    /** Port forwards and connects to the postgres and initiates a provision */
    async ensurepostgresIsProvisioned() {
        if (!this.hasDatabasesToConfigure) {
            this.status?.push('Setting up postgres databases')
            this.status?.pop(true)
            return
        }

        await this.cluster
            .begin('Setting up postgres databases')
            .beginForward(5432, this.runningPod)
            .attempt(10, 5000, async (processor, attempt) => await this.connectpostgresClient(processor, attempt))
            .do(async (_, processor) => await this.provisionpostgres(processor))
            .do(async _ => await this.disconnectpostgresClient())
            .endForward()
            .end()
    }

    //read the root password from the cluster secret, result is a decoded value
    async ensureRootPassword() {

        if (this.plainRootPasswordForInitialization) return

        const result = await this.cluster.read(this.rootSecret)
        result.throwIfError('Failed to load rootSecret')
        const secret = result.as<Secret>()

        const keys = Object.keys(secret.data)

        if (keys?.length !== 1)
            throw new Error('Failed to load rootSecret')

        this.plainRootPasswordForInitialization = Buffer.from(secret.data[keys[0]], 'base64').toString()
    }

    /** Attempts to connect to postgres and sets the postgresClient */
    async connectpostgresClient(processor, attempt) {

        this.ensureRootPassword()

        this.status?.info(`Attempt ${attempt + 1} to connect to postgres on local port ${processor.lastResult.other.localPort}`)

        //https://node-postgres.com/features/connecting
        const connectionArgs =
        {
            host: '127.0.0.1',
            port: processor.lastResult.other.localPort,
            user: this.rootUserName,
            password: this.plainRootPasswordForInitialization
        }

        this.connection = new Client(connectionArgs)
        await this.connection.connect()
        return true

    }

    /** Closes the postgresClient connection */
    async disconnectpostgresClient() {
        this.status?.info('Closing connection to postgres')
        await this.connection.end()
    }

    /**
     * Goes through all the configurations in the specs and calls setupDb
     * then upserts the configMap of connection strings in the secretKeyRef Secret
     */
    async provisionpostgres(processor) {
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
        `Server=${options.host}; Port=${options.port || 5432}; Uid=${options.username}; Pwd=${options.password}; Database=${options.database}`

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
        const host = `${this.postgresServiceName}.${this.serviceNamespace}.svc.cluster.local`
        const port = 5432
        const connectionString = this.toConnectionString({ username, password, host, port, database: dbName })

        const createDB = (config?.createDatabase === true)

        try {
            this.status?.push(`Creating database ${dbName}`)
            if(createDB)
                await this.connection.query(`CREATE DATABASE ${dbName};`)
        } finally {
            this.status?.pop(!createDB)
        }

        try {
            this.status?.push(`Setting up database user ${username}`)
            await this.connection.query(`CREATE ROLE ${username} LOGIN SUPERUSER PASSWORD '${password}';`)
        } finally {
            this.status?.pop()
        }

        if (process.env.NODE_ENV === 'development')
            this.status?.info(`Connection string ${connectionString}`)

        try {
            this.status?.push('Writing database connection information to Secrets')
            if (config.connectionStringSecretKey) this.configMap[config.connectionStringSecretKey] = Buffer.from(connectionString).toString('base64')
            if (config.usernameSecretKey) this.configMap[config.usernameSecretKey] = Buffer.from(username).toString('base64')
            if (config.passwordSecretKey) this.configMap[config.passwordSecretKey] = Buffer.from(password).toString('base64')
            if (config.rootUsernameSecretKey) this.configMap[config.rootUsernameSecretKey] = Buffer.from(this.rootUserName).toString('base64')
            if (config.rootPasswordSecretKey) this.configMap[config.rootPasswordSecretKey] = this.encodedRootPassword
            if (config.hostSecretKey) this.configMap[config.hostSecretKey] = Buffer.from(host).toString('base64')
            if (config.portSecretKey) this.configMap[config.portSecretKey] = Buffer.from(port.toString()).toString('base64')
            if (config.databaseSecretKey) this.configMap[config.databaseSecretKey] = Buffer.from(dbName).toString('base64')
            if (config.databaseTypeSecretKey) this.configMap[config.databaseTypeSecretKey] = Buffer.from('pgsql').toString('base64')
        } finally {
            this.status?.pop()
        }
    }
}