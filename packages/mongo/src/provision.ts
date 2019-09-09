import { MongoClient } from 'mongodb'
import { createDebug, asyncForEach } from '@traxitt/common'
import { Context } from '@traxitt/kubeclient'
import { processPassword } from '@provisioner/common'

const debug = createDebug()

const toConnectionString = (options) =>
    `mongodb://${options.user}:${options.password}@${options.host}:${options.port}${options.db ? '/' + options.db : ''}`

export async function provision(context: Context) {
    debug('provision called', context)

    await context
        .object({
            kind: 'Pod'
        })
        .list({ name: 'mongo' })
        .check(
            (pods) => context.log('PODS', pods.result),
            provisionNewService
        )
        .run()
}

async function provisionNewService(pods) {
    // No mongo pods were found. Provision from scratch
    const { context } = pods

    // Generate and stash the rootPassword
    context.params.rootPassword = processPassword(context.params.spec.rootPassword)

    pods
        .watch()
        .when(({ condition }) => condition.Ready == 'True',() => {

            //
            pods
                .log(`${pods} is ready`)
                .doneWatch()
                .forward(27017)
                .attempt(10, 1000, connectMongoDb)
                .do(provisionMongoDb)
                .doneForward()
                .do(disconnectMongoDb)
                .run()
        })

    await context
        .fromFile('../k8s/pvc.yaml')
        .apply()
        .fromFile('../k8s/statefulset.yaml', { rootPassword: context.params.rootPassword })
        .apply()
        .fromFile('../k8s/service.yaml')
        .do(svc => context.params.mongoService = svc)
        .apply()
        .run()

    await pods.watchCompletion()
}

async function connectMongoDb(pod, attempt) {
    pod.log(`Attempt ${attempt + 1} to connect to mongo on local port ${pod.forwardLocalPort}`)
    return pod.context.params.mongoClient = await MongoClient.connect(`mongodb://root:${pod.context.params.rootPassword}@localhost:${pod.forwardLocalPort}`, { useNewUrlParser: true,  useUnifiedTopology: true })
}

async function disconnectMongoDb(pod) {
    pod.log(`Closing connection to mongodb`)
    await pod.context.params.mongoClient.close()
    delete pod.context.params.mongoClient
}

async function provisionMongoDb(pod) {
    const { context } = pod
    const { provisionContext } = context.params

    context.params.configMap = {}

    await asyncForEach(context.params.spec.config, async dbConfig => await setupDb(pod, dbConfig))

    await provisionContext
        .object({
            kind: 'Secret',
            metadata: { name: provisionContext.params.spec.secretKeyRef },
            data: context.params.configMap
        })
        .create()
        .run()
}

async function setupDb(pod, dbConfig) {
    const { context } = pod

    const dbName = Object.keys(dbConfig)[0]
    const config = dbConfig[dbName]

    context.log(`Configuring ${dbName}`)

    const db = context.params.mongoClient.db(dbName)
    const user = config.user || 'devUser'
    const password = processPassword(config.password)

    const roles = config.roles || ['readWrite']

    const result = await db.addUser(
        user,
        password,
        { roles })

    const host = `${context.params.mongoService.name}.${pod.namespace}.svc.cluster.local`
    const port = pod.forwardContainerPort

    const connectionString = toConnectionString({ user, password, host, port, db: dbName })
    if (process.env.TRAXITT_ENV == 'development')
        context.log(`Connection string ${connectionString}`)

    context.params.configMap[config.secretKey] = Buffer.from(connectionString).toString('base64')

    debug('addUser', result)
}