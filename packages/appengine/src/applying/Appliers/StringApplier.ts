import { ProvisionerManager } from '@provisioner/common'
import { Applier } from '..'
import { Buffer } from 'buffer'

export class StringApplier implements Applier {

    async apply(namespace: string, spec: any, manager : ProvisionerManager, verbose: boolean) {

        spec.env = ''

        if (spec.secrets) {
            spec.secretsContent = ''
            for (const item of spec.secrets) {
                if (!item.env || item.env === '') item.env = item.name
                const value = Buffer.from(item.value).toString('base64')
                spec.secretsContent += `    ${item.name}: '${value}'\n`
                spec.env += `        - name: ${item.env}\n          valueFrom:\n            secretKeyRef:\n                name: ${spec.name}secrets\n                key: ${item.name}\n`
            }

            if(verbose) console.log(`secretsContent:\n${spec.secretsContent}`)

            await manager.cluster
                .begin('Installing the Secrets')
                .addOwner(manager.document)
                .upsertFile('../../../k8s/latest/1-secrets.yaml', { ...spec, namespace })
                .end()
        }

        if (spec.configs) {
            spec.configsContent = ''
            for (const item of spec.configs) {
                if (!item.env || item.env === '') item.env = item.name
                spec.configsContent += `    ${item.name}: '${item.value}'\n`
                spec.env += `        - name: ${item.env}\n          valueFrom:\n            configMapKeyRef:\n              name: ${spec.name}configs\n              key: ${item.name}\n`
            }
            if(verbose) console.log(`configsContent:\n${spec.configsContent}`)

            await manager.cluster
                .begin('Installing the Configuration Settings')
                .addOwner(manager.document)
                .upsertFile('../../../k8s/latest/2-configmap.yaml', { ...spec, namespace })
                .end()
        }

        spec.portsContent = ''   //deployment

        if (spec.ports && spec.ports.length > 0) {

            spec.portsContent = '        ports:\n'   //deployment
            spec.servicePortContent = '  ports:\n'   //service/nodePort

            for (const item of spec.ports) {
                spec.portsContent += `            - name: '${item.name}'\n              containerPort: ${item.number}\n`
                spec.servicePortContent += `    - name: '${item.name}'\n      port: ${item.number}\n      targetPort: '${item.targetPort}'\n`
            }
            if(verbose) console.log(`portsContent:\n${spec.portsContent}`)
            if(verbose) console.log(`servicePortContent:\n${spec.servicePortContent}`)

            await manager.cluster
                .begin('Installing Networking Services')
                .addOwner(manager.document)
                .upsertFile('../../../k8s/latest/5-service.yaml', { ...spec, namespace })
                .end()

        }

        spec.volumeMounts = ''
        spec.deployVolumes = ''

        if (spec.volumes && spec.volumes.length > 0) {
            spec.volumeMounts = '        volumeMounts:\n'
            spec.deployVolumes = '      volumes:\n'

            for (const item of spec.volumes) {
                if (item.name && item.name !== '') {
                    spec.volumeMounts += `        - name: '${item.name}'\n          mountPath: ${item.mountPath}\n`
                    spec.deployVolumes += `      - name: '${item.name}'\n        persistentVolumeClaim:\n          claimName: ${item.name}\n`

                    await manager.cluster
                        .begin(`Installing Volume ${item.name}`)
                        .addOwner(manager.document)
                        .upsertFile('../../../k8s/latest/3-pvc.yaml', { ...spec, namespace, size: item.size, volumeName: item.name })
                        .end()
                }
            }
        }
        if(verbose) console.log(`volumeMounts:\n${spec.volumeMounts}`)
        if(verbose) console.log(`deployVolumes:\n${spec.deployVolumes}`)

        await manager.cluster
            .begin('Installing the Deployment')
            .addOwner(manager.document)
            .upsertFile('../../../k8s/latest/4-deployment.yaml', { ...spec, namespace })
            .end()



    }

}