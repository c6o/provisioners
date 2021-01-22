import * as yaml from 'js-yaml'
import { baseProvisionerType } from '../index'
import { Buffer } from 'buffer'

export const apiMixin = (base: baseProvisionerType) => class extends base {

    runningDeployent

    prometheusNamespace: string
    clientApp: string
    clientNamespace: string

    configMap: any
    prometheusConfig: any
    hasConfigChanged: boolean

    addedSecrets: any[]
    removedSecrets: any[]

    getPrometheusDeployment = async (namespace) => {
        const deployment = {
            apiVersion: 'apps/v1',
            kind: 'Deployment',
            metadata: {
                namespace,
                name: 'prometheus-server',
                labels: {
                    app: 'prometheus',
                    component: 'server'
                }
            }
        }

        return await this.manager.cluster.read(deployment)
    }

    async clearAll(namespace: string, clientNamespace: string, clientApp: string) {
        await this.beginConfig(namespace, clientNamespace, clientApp)
        await this.removeAllJobs()
        //this.removeAllCerts()
        await this.endConfig()
    }

    /**
     * Begin changing configuration of Prometheus
     *
     * @param {string} clientNamespace of the owner app
     * @param {string} clientApp app
     */
    async beginConfig(namespace: string, clientNamespace: string, clientApp: string) {

        if (this.runningDeployment)
            throw Error('There is already a running configuration transaction')

        let result = await this.getPrometheusDeployment(namespace)

        if (result.error) throw result.error
        this.runningDeployment = result.object

        this.clientNamespace = clientNamespace
        this.clientApp = clientApp

        result = await this.manager.cluster.read({
            kind: 'ConfigMap',
            metadata: {
                namespace,
                name: 'prometheus-server'
            }
        })

        if (result.error)
            throw result.error

        this.configMap = result.object
        this.prometheusConfig = yaml.load(this.configMap.data['prometheus.yml'])
        this.hasConfigChanged = false

        this.addedSecrets = []
        this.removedSecrets = []
    }

    /**
     * Add a job to the prometheus configuration
     * The name in the config will be {clientNamespace-clientApp}-{jobName}
     *
     * @param {string} jobYaml list of jobs to add
     * @returns {Promise<void>}
     */
    async addJobs(jobs): Promise<void> {
        const scrapeConfigs = this.prometheusConfig['scrape_configs']

        jobs.forEach(job => {
            const newJobName = `${this.clientNamespace}-${this.clientApp}-${job['job_name']}`
            const found = scrapeConfigs.find(e => e['job_name'] === newJobName)

            if (!found) {
                job['job_name'] = newJobName
                scrapeConfigs.push(job)
            }
        })

        this.hasConfigChanged = true
    }

    /**
     * Remove job from the configuration by name.
     * The scrape job name in the prometheus.yaml will be {clientNamespace-clientApp}-{jobName}
     *
     * @param {*} name name of job to remove
     * @returns {Promise<void>}
     */
    async removeJob(jobName): Promise<void> {
        const newJobName = `${this.clientNamespace}-${this.clientApp}-${jobName}`
        const scrapeConfigs = this.prometheusConfig['scrape_configs']
        const found = scrapeConfigs.find(e => e['job_name'] === newJobName)
        if (found) {
            this.prometheusConfig['scrape_configs'] = scrapeConfigs.filter( job => job['job_name'] !== newJobName)
            this.hasConfigChanged = true
        }
    }

    /**
     * Remove all jobs from the configuration for the client app
     *
     * @param {*} name name of job to remove
     * @returns {Promise<void>}
     */
    async removeAllJobs(): Promise<void> {
        const jobPrefix = `${this.clientNamespace}-${this.clientApp}`
        const scrapeConfigs = this.prometheusConfig['scrape_configs']
        const found = scrapeConfigs.find(e => e['job_name'].startsWith(jobPrefix))
        if (found) {
            this.prometheusConfig['scrape_configs'] = scrapeConfigs.filter( job => !job['job_name'].startsWith(jobPrefix))
            this.hasConfigChanged = true
        }
    }

    /**
     * Add TLS configuration cert files for use in jobs.
     *
     * ca_file: CA certificate to validate API server certificate with.
     * cert_file: Certificate for client cert authentication to the server.
     * key_file: Key for client cert authentication to the server.
     *
     * Will be mounted in:
     *      /etc/certs/{clientNamespace}-{clientApp}-{name}/ca.pem
     *      /etc/certs/{clientNamespace}-{clientApp}-{name}/cert.pem
     *      /etc/certs/{clientNamespace}-{clientApp}-{name}/key.pem
     */
    async addTlsCerts(name, certs) {
        const namespace = this.runningDeployent.metadata.namespace
        const certName = `${this.clientNamespace}-${this.clientApp}-${name}`

        // create a new secret
        const newSecret = this.certSecret(`prometheus-${certName}`, namespace)
        // add the new cert secret
        const secretsData = newSecret['data'] = {}

        secretsData['ca.pem'] = certs.ca_file ? Buffer.from(certs.ca_file).toString('base64'):''
        secretsData['cert.pem'] = certs.cert_file ? Buffer.from(certs.cert_file).toString('base64'):''
        secretsData['key.pem'] = certs.key_file ? Buffer.from(certs.key_file).toString('base64'):''

        this.addedSecrets.push(newSecret)

        // update the deployment
        const volume = {
            name: `cert-${certName}`,
            secret: {
                defaultMode: 420,
                secretName: `prometheus-${certName}`
            }
        }

        const volumeMount = {
            name: `cert-${certName}`,
            mountPath: `/etc/certs/${certName}`
        }

        const volumeArray = this.runningDeployment.spec.template.spec.volumes
        let index = volumeArray.findIndex(vol => vol.name === volume.name)
        if (index === -1)
            volumeArray.push(volume)

        // container 1 is the prometheus server
        const volumeMountArray = this.runningDeployment.spec.template.spec.containers[1].volumeMounts
        index = volumeMountArray.findIndex(vol => vol.name === volumeMount.name)
        if (index === -1)
            volumeMountArray.push(volumeMount)
    }

    /**
     * Remove certs for TLS configuration
     *
     */
    async removeTlsCerts(name) {
        const namespace = this.runningDeployent.metadata.namespace

        const certName = `${this.clientNamespace}-${this.clientApp}-${name}`
        const removeSecret = this.certSecret(name, namespace)
        this.removedSecrets.push(removeSecret)

        const volumeName = `cert-${certName}`
        // remove the dashboard volume and volume mount from the deployment
        const volumeArray = this.runningDeployment.spec.template.spec.volumes
        let index = volumeArray.findIndex(vol => vol.name === volumeName)
        if (index !== -1)
            volumeArray.splice(index,1)

        const volumeMountArray = this.runningDeployment.spec.template.spec.containers[1].volumeMounts
        index = volumeMountArray.findIndex(vol => vol.name === volumeName)
        if (index !== -1)
            volumeMountArray.splice(index,1)
    }

    certSecret(name, namespace) {
        return {
            kind: 'Secret',
            metadata: {
                name,
                namespace,
                labels: {
                    name: 'prometheus-server'
                }
            },
            type: 'Opaque'
        }
    }

    /**
     * Write configuration changes and restart deployment
     *
     */
    async endConfig() {
        let restart = false

        // not sure we really need to restart if config changes - seems to have a container to do this
        if (this.hasConfigChanged) {
            const result = await this.manager.cluster.patch(this.configMap, {
                data: {
                    'prometheus.yml': yaml.dump(this.prometheusConfig)
                }
            })
            if (result.error)
                throw result.error
            restart = true
        }

        for (const secret of this.addedSecrets) {
            const result = await this.manager.cluster.upsert(secret)
            if (result.error) throw result.error
            restart = true
        }

        for (const secret of this.removedSecrets) {
            const result = await this.manager.cluster.delete(secret)
            if (result.error) throw result.error
            restart = true
        }

        if (restart) {
            await this.manager.cluster.upsert(this.runningDeployment)
            const previousCount = this.runningDeployment.spec?.replicas || 0
            await this.manager.cluster.patch(this.runningDeployment, { spec: { replicas: 0 } })
            await this.manager.cluster.patch(this.runningDeployment, { spec: { replicas: previousCount } })
        }
        this.runningDeployment = null
    }
}