import { Secret } from '@c6o/kubeclient-resources/core/v1'
import { processPassword } from '@provisioner/common'
import { baseProvisionerType } from '../'
import { Buffer } from 'buffer'
import { MongoClient } from 'mongodb'

export const createApplyMixin = (base: baseProvisionerType) => class extends base {

    // protected members
    runningPod
    rootPassword
    mongoDbClient: MongoClient
    configMap
    namespace

    mongoServiceName = 'mongo-svc'
    get mongoPods() { return {
            kind: 'Pod',
            metadata: {
                namespace: this.serviceNamespace,
                labels: {
                    name: 'mongo'
                }
            }
        }
    }

    get rootSecret() { return {
            kind: 'Secret',
            metadata: {
                namespace: this.serviceNamespace,
                name: 'mongo-root'
            }
        }
    }

    toConnectionString = (options) =>
        `mongodb://${options.user}:${options.password}@${options.host}:${options.port}${options.db ? '/' + options.db : ''}`

    async createApply() {
        await this.ensureServiceNamespacesExist()
        await this.ensureMongoDbIsInstalled()
        await this.ensureMongoDbIsRunning()
        await this.ensureMongoDbIsProvisioned()
    }

    async ensureRootPassword() {
        if (this.rootPassword) return
        const result = await super.cluster.read(this.rootSecret)
        result.throwIfError('Failed to load rootSecret')
        const secret = result.as<Secret>()

        const keys = Object.keys(secret.data)
        if (keys?.length !== 1)
            throw new Error('Failed to load rootSecret')

        this.rootPassword = Buffer.from(secret.data[keys[0]], 'base64').toString()
    }

    /** Looks for mongo pods and if none are found, applies the appropriate yaml */
    async ensureMongoDbIsInstalled() {

        await super.cluster
            .begin('Install mongo services')
            .list(this.mongoPods)
            .do((result, processor) => {

                if (result?.object?.items?.length == 0) {
                    // There are no mongo-db pods

                    // Generate and stash the rootPassword
                    this.rootPassword = processPassword(this.spec.rootPassword)
                    const namespace = this.serviceNamespace
                    const storageClass = this.spec.storageClass
                    const rootPasswordKey = this.spec.rootPasswordKey || 'password'

                    // Install mongodb
                    processor
                        .mergeWith(super.documentHelper.appComponentMergeDocument)
                        .upsertFile('../../k8s/pvc.yaml', { namespace, storageClass })
                        .upsertFile('../../k8s/statefulset.yaml', { namespace, rootPassword: this.rootPassword, appLabels: this.documentHelper.componentLabels })
                        .upsertFile('../../k8s/service.yaml', { namespace })
                        .upsertFile('../../k8s/root-secret.yaml', { namespace, rootPasswordKey, rootPassword: Buffer.from(this.rootPassword).toString('base64') })
                }
            })
            .end()
    }
    
    /** Watches pods and ensures that a pod is running and sets runningPod */
    async ensureMongoDbIsRunning() {
        await super.cluster.
            begin('Ensure mongo services are running')
                .beginWatch(this.mongoPods)
                .whenWatch(({ condition }) => condition.Ready == 'True', (processor, pod) => {
                    this.runningPod = pod
                    processor.endWatch()
                })
            .end()
    }
    
    /** Port forwards and connects to the mongoDb and initiates a provision */
    async ensureMongoDbIsProvisioned() {
        if (!this.hasDatabasesToConfigure) {
            super.status?.push('Setting up mongo databases')
            super.status?.pop(true)
            return
        }

        await super.cluster
            .begin('Setting up mongo databases')
                .beginForward(27017, this.runningPod)
                .attempt(10, 1000, async (processor, attempt) => await this.connectMongoDbClient(processor, attempt))
                .do(async (_, processor) => await this.provisionMongoDb(processor))
                .do(async _ => await this.disconnectMongoDbClient())
                .endForward()
            .end()
    }
    
    /** Attempts to connect to MongoDb and sets the mongoDbClient */
    async connectMongoDbClient(processor, attempt) {
        this.ensureRootPassword()
        const connectionString = `mongodb://root:${this.rootPassword}@localhost:${processor.lastResult.other.localPort}`
        super.status?.info(`Attempt ${attempt + 1} to connect to mongo on local port ${processor.lastResult.other.localPort}`)
        return this.mongoDbClient = await MongoClient.connect(connectionString, { useNewUrlParser: true, useUnifiedTopology: true })
    }

    /** Closes the mongoDbClient connection */
    async disconnectMongoDbClient() {
        super.status?.info('Closing connection to mongodb')
        await this.mongoDbClient.close()
    }

    /**
     * Goes through all the configurations in the specs and calls setupDb
     * then upserts the configMap of connection strings in the secretKeyRef Secret
     */
    async provisionMongoDb(processor) {
        this.configMap = {}

        for(const dbConfig of this.spec.config)
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

    /**
     * Creates a the database based on the dbConfig and adds the connection string to configMap
     * @param cluster
     * @param dbConfig 
     */
    async setupDb(dbConfig) {
        try {
            const dbName = Object.keys(dbConfig)[0]
            const config = dbConfig[dbName]
    
            super.status?.push(`Configuring database ${dbName}`)

            const db = this.mongoDbClient.db(dbName)
            const user = config.user || 'devUser'
            const password = processPassword(config.password)
    
            const roles = config.roles || ['readWrite']
    
            await db.addUser(user, password, { roles })

            const host = `${this.mongoServiceName}.${this.serviceNamespace}.svc.cluster.local`
            const port = 27017

            const connectionString = this.toConnectionString({ user, password, host, port, db: dbName })
            if (process.env.TRAXITT_ENV == 'development')
                super.status?.info(`Connection string ${connectionString}`)

            this.configMap[config.secretKey] = Buffer.from(connectionString).toString('base64')
        }
        catch (ex) {
            if (!ex.code || ex.code != 51003) {
                // User already exists
                throw ex
            }
        }
        finally {
            super.status?.pop()
        }
    }
}