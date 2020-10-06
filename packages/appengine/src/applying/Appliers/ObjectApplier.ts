import { ProvisionerManager } from '@provisioner/common'
import { Applier } from '..'
import { Buffer } from 'buffer'

export class ObjectApplier implements Applier {

    async apply(namespace: string, spec: any, manager: ProvisionerManager, verbose: boolean) {

        let envVariables = await this.applySecrets(namespace, spec, manager, verbose)
        envVariables = await this.applyConfigs(namespace, spec, manager, verbose, envVariables)

    }
    async applyConfigs(namespace: string, spec: any, manager: ProvisionerManager, verbose: boolean, envVariables: any) {

        if (spec.configs && spec.configs.length > 0) {

            let config = {
                apiVersion: 'v1',
                kind: 'ConfigMap',
                metadata: {
                    name: `${spec.name}configs`,
                    namespace: namespace,
                    labels: {
                        app: spec.name,
                        'system.codezero.io/app': spec.name,
                        'system.codezero.io/appengine': 'v1'
                    }
                },
                data: {}
            }


            for (const item of spec.configs) {
                if (!item.env || item.env === '') item.env = item.name
                config.data[item.name] = item.value
                envVariables.push({ name: item.env, valueFrom: { secretKeyRef: { name: `${spec.name}configs`, key: item.name } } })
            }

            if (verbose) console.log('Applying configs:\n', spec.configs, '\n', config)

            if (!spec.dryRun) {
                await manager.cluster
                    .begin('Installing the Configuration Settings')
                    .addOwner(manager.document)
                    .upsert(config)
                    .end()
            }
            return envVariables
        }
    }


    async applySecrets(namespace: string, spec: any, manager: ProvisionerManager, verbose: boolean) {

        const envVariables = []

        if (spec.secrets && spec.secrets.length > 0) {

            let secret = {
                apiVersion: 'v1',
                kind: 'Secret',
                metadata: {
                    name: `${spec.name}secrets`,
                    namespace: namespace,
                    labels: {
                        app: spec.name,
                        'system.codezero.io/app': spec.name,
                        'system.codezero.io/appengine': 'v1'
                    }
                },
                type: 'Opaque',
                data: {}
            }


            for (const item of spec.secrets) {
                if (!item.env || item.env === '') item.env = item.name
                const value = Buffer.from(item.value).toString('base64')
                secret.data[item.name] = value
                envVariables.push({ name: item.env, valueFrom: { secretKeyRef: { name: `${spec.name}secrets`, key: item.name } } })
            }

            if (verbose) console.log('Applying secrets:\n', spec.secrets, '\n', secret)

            if (!spec.dryRun) {
                await manager.cluster
                    .begin('Installing the Secrets')
                    .addOwner(manager.document)
                    .upsert(secret)
                    .end()
            }
            return envVariables
        }
    }
}