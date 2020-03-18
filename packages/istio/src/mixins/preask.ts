import { baseProvisionerType } from '../index'

export const preConfigureMixin = (base: baseProvisionerType) => class extends base {

    async preask(options) {
        if (options['link-grafana'])
            await this.preLinkGrafana()
    }

    async preLinkGrafana() {
        const grafanaLink = await this.findGrafanaLinkConfigMap()
        if (grafanaLink.errorCode != 404)
            throw Error('Grafana is already linked. Please unlink it first.')

        const apps = await this.manager.getInstalledApps('grafana')
        const choices = apps.map(app => app.metadata.namespace)

        if (choices.length == 1) {
            this.grafanaNamespace = choices[0]
        } else if (choices.length > 1) {
            const selection = await this.manager.inquirer?.prompt({
                type: 'list',
                name: 'namespace',
                message: 'Which grafana would you like to link to?',
                choices
            })
            this.grafanaNamespace = selection.namespace
        }

        if (!this.grafanaNamespace)
            throw Error('Please install Grafana before trying to link to it.')

    }
}