import { Cluster } from '@traxitt/kubeclient'

export async function exec(cluster: Cluster, args) {
    const command = args[0]

    switch(command) {
        case 'snapshot':
            await takeSnapshot(cluster)
            // TODO: Ensure the snapshot is created
            break
        default:
            throw new Error(`Unknown command ${command}`)
    }
}

// From: https://www.digitalocean.com/docs/kubernetes/how-to/snapshot-volumes/
async function takeSnapshot(cluster: Cluster) {

    await cluster
        .begin('Requesting volume snapshot')
            .create({
                apiVersion: 'snapshot.storage.k8s.io/v1alpha1',
                kind: 'VolumeSnapshot',
                metadata: {
                    name: 'dev-snapshot',
                    namespace: 'traxitt-system'
                },
                spec: {
                    source: {
                        name: 'dev-pvc',
                        kind: 'PersistentVolumeClaim'
                    }
                }
            })
        .end()
}