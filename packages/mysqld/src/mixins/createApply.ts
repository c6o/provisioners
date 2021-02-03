import { baseProvisionerType } from '../'
import { Buffer } from 'buffer'
import { mysql } from 'mysql'

export const createApplyMixin = (base: baseProvisionerType) => class extends base {

    // protected members
    runningPod
    rootPassword
    mysqlClient: mysql
    configMap
    namespace

    mysqlServiceName = 'mysql-svc'
    get mysqlPods() { return {
            kind: 'Pod',
            metadata: {
                namespace: this.serviceNamespace,
                labels: {
                    name: 'mysql'
                }
            }
        }
    }

    get rootSecret() { return {
            kind: 'Secret',
            metadata: {
                namespace: this.serviceNamespace,
                name: 'mysql-root'
            }
        }
    }

    async createApply() {
        await this.ensureServiceNamespacesExist()
        await this.ensureMysqlIsInstalled()
        await this.ensureMysqlIsRunning()
        await this.ensureMysqlIsProvisioned()
    }

    async ensureRootPassword() {
        if (this.rootPassword) return
        const result = await this.manager.cluster.read(this.rootSecret)
        if (!result.object)
            throw new Error('Failed to load rootSecret')
        const keys = Object.keys(result.object.data)
        if (keys?.length !== 1)
            throw new Error('Failed to load rootSecret')

        this.rootPassword = Buffer.from(result.object.data[keys[0]], 'base64').toString()
    }

    /** Looks for mysql pods and if none are found, applies the appropriate yaml */
    async ensureMysqlIsInstalled() {

        await this.manager.cluster
            .begin('Install mysql services')
            .list(this.mysqlPods)
            .do((result, processor) => {

                if (result?.object?.items?.length == 0) {
                    // There are no mysql-db pods

                    // Generate and stash the rootPassword
                    this.rootPassword = super.processPassword(this.spec.rootPassword)
                    const namespace = this.serviceNamespace
                    const storageClass = this.spec.storageClass
                    const rootPasswordKey = this.spec.rootPasswordKey || 'password'

                    // Install mysql
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
    async ensureMysqlIsRunning() {
        await this.manager.cluster.
            begin('Ensure mysql services are running')
                .beginWatch(this.mysqlPods)
                .whenWatch(({ condition }) => condition.Ready == 'True', (processor, pod) => {
                    this.runningPod = pod
                    processor.endWatch()
                })
            .end()
    }

    /** Port forwards and connects to the mysql and initiates a provision */
    async ensureMysqlIsProvisioned() {
        if (!this.hasDatabasesToConfigure) {
            this.manager.status?.push('Setting up mysql databases')
            this.manager.status?.pop(true)
            return
        }

        await this.manager.cluster
            .begin('Setting up mysql databases')
                .beginForward(3306, this.runningPod)
                .attempt(10, 1000, async (processor, attempt) => await this.connectMysqlClient(processor, attempt))
                .do(async (_, processor) => await this.provisionMysql(processor))
                .do(async _ => await this.disconnectMysqlClient())
                .endForward()
            .end()
    }

    /** Attempts to connect to mysql and sets the mysqlClient */
    async connectMysqlClient(processor, attempt) {
        this.ensureRootPassword()
        //const connectionString = `mongodb://root:${this.rootPassword}@localhost:${processor.lastResult.other.localPort}`
        this.manager.status?.info(`Attempt ${attempt + 1} to connect to mysql on local port ${processor.lastResult.other.localPort}`)
        return this.connection = (await this.mysqlClient.createConnection(processor.lastResult.other)).connect()
    }

    /** Closes the mysqlClient connection */
    async disconnectMysqlClient() {
        this.manager.status?.info('Closing connection to mysql')
        await this.connection.end()
    }

    /**
     * Goes through all the configurations in the specs and calls setupDb
     * then upserts the configMap of connection strings in the secretKeyRef Secret
     */
    async provisionMysql(processor) {
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

            this.manager.status?.push(`Configuring database ${dbName}`)

            const db = this.mysqlClient.db(dbName)
            const user = config.user || 'devUser'
            const password = super.processPassword(config.password)

            const roles = config.roles || ['readWrite']

            await db.addUser(user, password, { roles })

            const host = `${this.mysqlServiceName}.${this.serviceNamespace}.svc.cluster.local`
            const port = 3306

            this.configMap[config.secretKey] = Buffer.from(JSON.stringify({ user, password, host, port, database: dbName })).toString('base64')
        }
        catch (ex) {
            if (!ex.code || ex.code != 51003) {
                // User already exists
                throw ex
            }
        }
        finally {
            this.manager.status?.pop()
        }
    }
}