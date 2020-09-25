import { baseProvisionerType } from '../index'
import { Buffer } from 'buffer'

export const createApplyMixin = (base: baseProvisionerType) => class extends base {

    async createApply() {
        await this.ensureServiceNamespacesExist()
        await this.ensureNextCloudIsInstalled()
        await this.ensureNextCloudIsRunning()
    }

    get nextCloudPods() {
        return {
            kind: 'Pod',
            metadata: {
                namespace: this.serviceNamespace,
                labels: {
                    name: 'nextcloud'
                }
            }
        }
    }

    get systemServerConfigMap() {
        return {
            kind: 'ConfigMap',
            metadata: {
                namespace: 'c6o-system',
                name: 'system-server-config' // constants?
            }
        }
    }

    async getNextCloudDomain() {
        const result = await this.manager.cluster.read(this.systemServerConfigMap)
        if (result.error) {
            // TODO: log failure
            console.log('ERROR: Could not lookup host.', result.error);
            return null;
        }

        const host = result.object?.data?.HOST;
        if (!host) {
            // TODO: log missing host
            console.log('ERROR: Cluster HOST name is missing.', result);
            return null;
        }

        return `${this.spec.applicationName}-${this.serviceNamespace}.${host}`
    }

    async ensureNextCloudIsInstalled() {

        const namespace = this.serviceNamespace
        const {
            applicationName,
            tag,
            storageClass,
            storage,
            adminUsername,
            adminPassword,
            sql = {},
         } = this.spec

        if (sql.enabled) {
            sql.username = sql.username || 'nextcloud-db-user';
            sql.password = super.processPassword(sql.password);

            // Base64 Encode (required by secrets)
            // TODO: would be nice to have a handlebars helper to convert to base64
            sql.password64 = Buffer.from(sql.password).toString('base64')

            if(sql.selfHosted) {
                sql.host = 'nextcloud-db'
                sql.port = 3306
                sql.rootPassword = super.generatePassword();
                sql.rootPassword64 = Buffer.from(sql.rootPassword).toString('base64')
            }
        } else {
            sql.selfHosted = false
        }

        // lookup hostname for the current cluster.
        const hostname = await this.getNextCloudDomain()

        await this.manager.cluster
            .begin('Install NextCloud services')
                .list(this.nextCloudPods)
                .do((result, processor) => {
                    if (result?.object?.items?.length == 0) {
                        // There are no NextCloud pods running

                        processor
                            .addOwner(this.manager.document)
                            .upsertFile('../../k8s/pvc.yaml', { namespace, applicationName, storage, storageClass })
                            .upsertFile('../../k8s/secrets.yaml', { 
                                namespace, 
                                applicationName, 
                                adminUsername: Buffer.from(adminUsername).toString('base64'), 
                                adminPassword: Buffer.from(adminPassword).toString('base64'),
                                sql,
                            })

                        // Install MySQL
                        if (sql.selfHosted) {
                            processor.upsertFile('../../k8s/deployment-mysql.yaml', {namespace, applicationName, sql});
                        }

                        // Install NextCloud
                        processor
                            .upsertFile('../../k8s/deployment.yaml', { namespace, applicationName, tag, hostname, sql })
                            .upsertFile('../../k8s/service.yaml', { namespace, applicationName })
                    }
                })
            .end()
    }

    async ensureNextCloudIsRunning() {
        await this.manager.cluster.
            begin('Ensure a NextCloud replica is running')
                .beginWatch(this.nextCloudPods)
                .whenWatch(({ condition }) => condition.Ready == 'True', (processor, pod) => {
                    processor.endWatch()
                })
            .end()
    }
}