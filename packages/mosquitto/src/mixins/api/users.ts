import { baseProvisionerType } from '../../'

declare module '../../' {
    export interface Provisioner {
        addUser(username: string, password: string, namespace: string)
        removeUser(username: string, namespace: string)
    }
}

export const userMgmtMixin = (base: baseProvisionerType) => class extends base {

    passwdConfigMap: any = {
        apiVersion: 'v1',
        kind: 'ConfigMap',
        metadata: {
            name: 'mosquitto-users-config'
        }
    }

    async addUser(username: string, password: string, namespace: string) {

        this.passwdConfigMap.metadata.namespace = namespace
        let result = await this.mana.cluster.read(this.passwdConfigMap)
        if (result.error)
            throw new Error('Failed to load Mosquitto password configMap')
        const currentUsers = result.object
        // check if user exists
        // modify currentUsers.data
        result.object.data
        result = await this.mana.cluster.update(this.passwdConfigMap, currentUsers)
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