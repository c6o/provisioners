import { Buffer } from 'buffer'
import { MongoClient } from 'mongodb'
import { createDebug, asyncForEach } from '@traxitt/common'
import { Cluster, Processor } from '@traxitt/kubeclient'
import { processPassword } from '@provisioner/common'
import { ensureNamespaceExists } from '@provisioner/common'

const debug = createDebug()

const toConnectionString = (options) =>
    `mongodb://${options.user}:${options.password}@${options.host}:${options.port}${options.db ? '/' + options.db : ''}`

const mongoServiceName = 'mongo-svc'
let namespace
let mongoPods
let runningPod
let rootPassword
let rootSecret
let mongoDbClient: MongoClient
let configMap

export async function provision(cluster: Cluster, spec) {
    debug('provision called', cluster)

    await ensureNamespaceExists(cluster, spec)

    init(spec)

    await ensureMongoDbIsInstalled(cluster, spec)
    await ensureMongoDbIsRunning(cluster)
    await ensureMongoDbIsProvisioned(cluster, spec)
}

function init(spec) {
    namespace = spec.namespace.metadata.name

    mongoPods = {
        kind: 'Pod',
        metadata: {
            namespace,
            labels: {
                name: 'mongo'
            }
        }
    }

    rootSecret = {
        kind: 'Secret',
        metadata: {
            namespace,
            name: 'mongo-root'
        }
    }
}

/** Looks for mongo pods and if none are found, applies the appropriate yaml */
async function ensureMongoDbIsInstalled(cluster: Cluster, spec) {
    await cluster
        .begin(`Install mongo services`)
        .list(mongoPods)
        .do((result, processor) => {

            if (result?.object?.items?.length == 0) {
                // There are no mongo-db pods

                // Generate and stash the rootPassword
                rootPassword = processPassword(spec.rootPassword)

                // Install mongodb
                processor
                    .upsertFile('../k8s/pvc.yaml', { namespace })
                    .upsertFile('../k8s/statefulset.yaml', { namespace, rootPassword })
                    .upsertFile('../k8s/service.yaml', { namespace })
                    .upsertFile('../k8s/root-secret.yaml', { namespace, rootPassword: Buffer.from(rootPassword).toString('base64') })

            }
            else {
                // Mongodb is already installed. Fetch the rootPassword

                processor
                    .read(rootSecret)
                    .do(result => {
                        if (!result.object)
                            throw new Error('Failed to load rootSecret')
                        rootPassword = Buffer.from(result.object.data.password, 'base64').toString()
                    })
            }
        })
        .end()
}

/** Watches pods and ensures that a pod is running and sets runningPod */
async function ensureMongoDbIsRunning(cluster: Cluster) {
    await cluster.
        begin(`Ensure mongo services are running`)
        .beginWatch(mongoPods)
        .whenWatch(({ condition }) => condition.Ready == 'True', (processor, pod) => {
            runningPod = pod
            processor.endWatch()
        })
        .end()
}

/** Port forwards and connects to the mongoDb and initiates a provision */
async function ensureMongoDbIsProvisioned(cluster: Cluster, spec) {
    await cluster
        .begin(`Setting up mongo databases`)
            .beginForward(27017, runningPod)
            .attempt(10, 1000, connectMongoDbClient)
            .do(async (_, processor) => await provisionMongoDb(processor, spec))
            .endForward()
            .do(disconnectMongoDbClient)
        .end()
}

/** Attempts to connect to MongoDb and sets the mongoDbClient */
async function connectMongoDbClient(processor, attempt) {
    const connectionString = `mongodb://root:${rootPassword}@localhost:${processor.lastResult.other.localPort}`
    processor.cluster.status?.log(`Attempt ${attempt + 1} to connect to mongo on local port ${processor.lastResult.other.localPort}`)
    return mongoDbClient = await MongoClient.connect(connectionString, { useNewUrlParser: true, useUnifiedTopology: true })
}

/** Closes the mongoDbClient connection */
async function disconnectMongoDbClient(_, processor: Processor) {
    processor.cluster.status?.log(`Closing connection to mongodb`)
    mongoDbClient.close()
}

/**
 * Goes through all the configurations in the specs and calls setupDb
 * then upserts the configMap of connection strings in the secretKeyRef Secret
 */
async function provisionMongoDb(processor, spec) {
    configMap = {}
    await asyncForEach(spec.config, async dbConfig => await setupDb(processor.cluster, dbConfig))

    if (Object.keys(configMap).length) {
        // We have some secrets to add
        const configMapSecret = {
            kind: 'Secret',
            metadata: {
                namespace: spec.provisionSpec.namespace.metadata.name,
                name: spec.secretKeyRef || spec.provisionSpec.secretKeyRef || 'mongo-connections'
            },
            data: configMap
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
async function setupDb(cluster: Cluster, dbConfig) {
    try {
        const dbName = Object.keys(dbConfig)[0]
        const config = dbConfig[dbName]

        cluster.status?.push(`Configuring database ${dbName}`)

        const db = mongoDbClient.db(dbName)
        const user = config.user || 'devUser'
        const password = processPassword(config.password)

        const roles = config.roles || ['readWrite']

        await db.addUser(user, password, { roles })

        const host = `${mongoServiceName}.${namespace}.svc.cluster.local`
        const port = 27017

        const connectionString = toConnectionString({ user, password, host, port, db: dbName })
        if (process.env.TRAXITT_ENV == 'development') {
            cluster.status?.log(`Connection string ${connectionString}`)
        }

        configMap[config.secretKey] = Buffer.from(connectionString).toString('base64')
    }
    catch (ex) {
        if (!ex.code || ex.code != 51003) {
            // User already exists
            throw ex
        }
    }
    finally {
        cluster.status?.pop()
    }
}