import { createDebug } from '@traxitt/common'
import { Cluster, Processor } from '@traxitt/kubeclient'

const debug = createDebug()
const expectedCRDCount = 22

let namespace
let crdDocument

export async function provision(cluster: Cluster, spec) {
    debug('provision called', spec)

    init(spec)
    await installCrds(cluster)
    await ensureCrdsApplied(cluster)
    await installIstioServices(cluster)
}

function init(spec) {
    namespace = spec.namespace.metadata.name

    crdDocument = {
        apiVersion: 'apiextensions.k8s.io/v1beta1',
        kind: 'CustomResourceDefinition',
        metadata: {
            namespace,
            labels: {
                release: 'istio'
            }
        }
    }
}

async function installCrds(cluster: Cluster) {
    await cluster
            .begin(`Install istio resource definitions`)
                .apply('../k8s/crds.yaml')
            .end()
}

async function installIstioServices(cluster: Cluster) {
    await cluster
            .begin(`Install istio services`)
                .apply('../k8s/istio-demo.yaml')
            .end()
}


async function ensureCrdsApplied(cluster: Cluster) {
    await cluster
            .begin(`Insure istio resource definitions applied`)
                .attempt(10, 1000, countCRDs)
            .end()

}

async function countCRDs(processor: Processor, attempt) {
    const cluster = new Cluster(processor.cluster.options)
    let count = 0
    await cluster
            .begin()
                .list(crdDocument)
                .do( result =>
                    count = result?.object?.items?.length
                )
            .end()

    cluster.status.log(`Retrieved ${count} out of ${expectedCRDCount} CRDs attempt ${attempt}`)
    return count > expectedCRDCount
}
