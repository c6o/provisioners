import { baseProvisionerType } from '../index'
import { KubeDocument, Result } from '@traxitt/kubeclient'

export const apiMixin = (base: baseProvisionerType) => class extends base {
    spec = {
        find: async (query) => query
    }

    async getSpec({foo}): Promise<KubeDocument> {
        return {
            kind: 'Helloxx' + foo,
            spec: 'World'
        }
    }

    async postSpec(query, val): Promise<KubeDocument> {
        return {...query, ...val}
    }

    async deleteSpec(foo): Promise<any> {
        return {result : 'GOodbye'+ foo}
    }

    async getServiceSpec(val): Promise<KubeDocument> {
        return {
            kind: 'Hello' + (val ? val.toString() : 'nothing sent'),
            spec: 'World'
        }
    }
}