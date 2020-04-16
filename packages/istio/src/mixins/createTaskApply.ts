import { baseProvisionerType } from '../index'

export const createTaskApplyMixin = (base: baseProvisionerType) => class extends base {

    async createTaskApply() {
        switch(this.taskSpec.metadata?.labels?.ask) {
            case 'link-grafana':
                await this.linkGrafana()
                break
            case 'unlink-grafana':
                await this.unlinkGrafana()
                break
            case 'link-prometheus':
                await this.linkPrometheus(this.appNamespace, 'istio-system')
                break
            case 'unlink-prometheus':
                await this.unlinkPrometheus(this.appNamespace, 'istio-system')
                break
            default:
                throw new Error(`Unknown ask ${this.taskSpec.metadata?.labels?.ask}`)
        }

        // const httpsRedirect = options['https-redirect']
        // if (httpsRedirect === true || httpsRedirect === false)
        //     await this.setHttpsRedirect(httpsRedirect)
    }
}