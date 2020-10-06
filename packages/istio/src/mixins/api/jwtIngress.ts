import { Result } from '@c6o/kubeclient'
import { AppDocument } from '@provisioner/common'
import { baseProvisionerType } from '../../'

export const jwtIngressApiMixin = (base: baseProvisionerType) => class extends base {

    app: AppDocument

    async addJwtToRuleSection(app: AppDocument, appId, namespaceId, secure) {
        this.app = app

        const rules: any[] = (await this.getAuthorizationPolicy()).object.spec.rules

        const item = this.jwtRuleToSectionTemplate(appId, namespaceId, secure)
        const alreadyExists = rules.find(item => item.to[0].operation.hosts[0] === this.computeHostPrefix(appId, namespaceId))
        if (!alreadyExists)
            return await this.manager.cluster.patch(this.authorizationPolicy, [{ 'op': 'add', 'path': '/spec/rules/-', 'value': item } ])

        const index = rules.map(function(item) { return item.to[0].operation.hosts[0] }).indexOf(this.computeHostPrefix(appId, namespaceId))
        return await this.manager.cluster.patch(this.authorizationPolicy, [{ 'op': 'replace', 'path': `/spec/rules/${index}`, 'value': item } ])
    }

    async removeJwtToRuleSection(app: AppDocument, appId, namespaceId) {
        this.app = app

        const rules: any[] = (await this.getAuthorizationPolicy()).object.spec.rules

        const index = rules.map(function(item) { return item.to[0].operation.hosts[0] }).indexOf(this.computeHostPrefix(appId, namespaceId))
        if (index !== -1) {
            return await this.manager.cluster.patch(this.authorizationPolicy, [{ 'op': 'remove', 'path': `/spec/rules/${index}` } ])
        }
    }

    authorizationPolicy = {
        apiVersion: 'security.istio.io/v1beta1',
        kind: 'AuthorizationPolicy',
        metadata: {
            name: 'ingress',
            namespace: 'istio-system'
        }
    }

    async getAuthorizationPolicy() {
        return await this.manager.cluster.read(this.authorizationPolicy)
    }

    computeHostPrefix(appId, namespaceId) {
        return `${appId}-${namespaceId}.*`
    }

    jwtRuleToSectionTemplate = (appId, namespaceId, isPublic: boolean) => {
        const rule: any = {
            to: [{
                operation: {
                    methods: ["*"],
                    hosts: [`${this.computeHostPrefix(appId, namespaceId)}`]
                }
            }]
        }
        if (!isPublic)
            rule.when = [{
                key: 'request.auth.claims[iss]',
                values: ['codezero-technologies-inc'] // must match config item authentication.jwtOptions.issuer
            }]
        return rule
    }
}