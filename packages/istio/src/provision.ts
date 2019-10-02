import { createDebug, asyncForEach } from '@traxitt/common'
import { Context } from '@traxitt/kubeclient'

const debug = createDebug()
const expectedCRDCount = 22

export async function provision(context: Context) {
    debug('provision called', context)

    const istioContext = new Context('istio-system', context.options)
    istioContext.log('\n###=> Setting up istio\n')

    await istioContext
        .namespaceObject
        .apply()
        .fromFile('../k8s/crds.yaml')
        .apply()
        .attempt(10, 10000, countCRDs)
        .fromFile('../k8s/istio-demo.yaml')
        .apply()
        .run()
}

async function countCRDs(context) {
    const namelessContext = new Context('istio-system', context.options)

    const crds =
        namelessContext
            .object({
                kind: 'CustomResourceDefinition',
                apiVersion: 'apiextensions.k8s.io/v1beta1'
            })
            .list({ release: "istio" })

    await namelessContext.run()

    const count = crds.result.items.length
    // crds.result.items.forEach(crd => namelessContext.log(`CRD: ${crd.metadata.name}`))
    namelessContext.log(`CustomResourceDefinitions applied ${count} of ${expectedCRDCount}`)
    return count >= expectedCRDCount
}
