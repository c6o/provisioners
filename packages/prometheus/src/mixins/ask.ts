import { baseProvisionerType } from '../index'

export const askMixin = (base: baseProvisionerType) => class extends base {

    async ask(options) {
        if (options['addJob']) {
            await this.beginConfig(this.prometheusNamespace, 'none', 'cli')
            await this.addJobs(this.jobConfig)
            await this.endConfig()
        } else if (options['removeJob']) {
            await this.beginConfig(this.prometheusNamespace, 'none', 'cli')
            await this.removeJob(this.removeJobName)
            await this.endConfig()
        } else if (options['addCert']) {
            await this.beginConfig(this.prometheusNamespace, 'none', 'cli')
            await this.addTlsCerts(this.certName, this.certFiles)
            await this.endConfig()
        } else if (options['removeCert']) {
            await this.beginConfig(this.prometheusNamespace, 'none', 'cli')
            await this.removeTlsCerts(this.certName)
            await this.endConfig()
        }
    }
}