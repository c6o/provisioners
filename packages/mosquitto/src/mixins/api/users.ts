import { baseProvisionerType } from '../../'

declare module '../../' {
    export interface Provisioner {
        addUser(username: string, password: string, namespace: string)
        removeUser(username: string, namespace: string)
    }
}

export const userMgmtMixin = (base: baseProvisionerType) => class extends base {

    mosquittoSettingsConfigMap: any = {
        apiVersion: 'v1',
        kind: 'ConfigMap',
        metadata: {
            name: 'mosquitto-config'
        }
    }

    async addUser(username: string, password: string, namespace: string) {

        debugger

        this.mosquittoSettingsConfigMap.metadata.namespace = namespace
        let result

        try {
            console.log('reading config map from cluster', this.mosquittoSettingsConfigMap)
            result = await this.manager.cluster.read(this.mosquittoSettingsConfigMap)
            console.log(result)
        } catch (e) {
            console.log(e)
            debugger
        }
        debugger
        if (result.error)
            throw new Error('Failed to load Mosquitto password configMap')
        const currentUsers = result.object
        // check if user exists
        // modify currentUsers.data
        result.object.data
        result = await this.mana.cluster.update(this.mosquittoSettingsConfigMap, currentUsers)
        if (result.error)
            throw new Error('Failed to save Mosquitto password configMap')
        // restart deployment
        // super.restartDeployment
    }

    async removeUser(username: string, namespace: string) {

    }

    async restartDeployment(namespace: string, name: string) {
        // const previousCount = this.runningDeployment.spec?.replicas || 0
        // await this.manager.cluster.patch(this.runningDeployment, { spec: { replicas: 0 } })
        // await this.manager.cluster.patch(this.runningDeployment, { spec: { replicas: previousCount } })
    }
}