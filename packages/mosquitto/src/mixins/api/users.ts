import mosquittoPasswd from 'mosquitto-passwd'
import parse from 'parse-passwd'
import { DeploymentHelper } from '@provisioner/common'

import { baseProvisionerType } from '../../'

declare module '../../' {
    export interface Provisioner {
        addUser(username: string, password: string, namespace: string, restart: boolean)
        removeUser(username: string, namespace: string, restart: boolean)
        updateUser(originalUsername: string, newUsername: string, password: string, namespace: string)
        listUsers(namespace: string)
        generateMosquittoUserPayload(username: string, password: string): Promise<string>
    }
}

export const userMgmtMixin = (base: baseProvisionerType) => class extends base {

    //taken from the yaml/deployment/metadata/name
    deploymentName = 'mosquitto'

    //taken from the yaml/configmap/metadata/name
    configMapName = 'mosquitto-config'

    async listUsers(namespace: string) {
        const settings = await this.readSettings(namespace)
        return settings.users
    }

    async parse(passwdPayload: string) {
        //returns {Array}: Array of user objects parsed from the content.
        return parse(passwdPayload)
    }
    async generateMosquittoUserPayload(username: string, password: string) {
        // Username, password, salt (optional, by default will generate 12 bytes salt)
        return await mosquittoPasswd(username, password)
    }

    async readSettings(namespace: string) {

        const settings: any = await this.getSettingsConfigMap(namespace, this.configMapName)

        settings.mosquittoConf = settings.configmap.data['mosquitto.conf']
        settings.userConf = settings.configmap.data['users.conf']
        settings.users = await this.parse(settings.userConf)

        return settings
    }

    async updateUser(originalUsername: string, newUsername: string, password: string, namespace: string) {
        await this.removeUser(originalUsername, namespace, false)
        await this.addUser(newUsername, password, namespace, true)
    }
    async addUser(username: string, password: string, namespace: string, restart: boolean) {

        const settings = await this.readSettings(namespace)

        const found = settings.users.find(user => user.username === username) !== undefined

        if (!found) {

            //use 3rd party modules to generate our username:password bits
            const userPayload = await this.generateMosquittoUserPayload(username, password)

            //add the new credential to the existing value
            settings.userConf += ('\n' + userPayload).trim()

            //update our config file/map to the full value
            //probably could condese all this down to a single, ugly line; but readability is important!
            settings.configmap.data['users.conf'] = settings.userConf

            //update our cluster/config map to reflect the change
            const updatedResult = await this.cluster.put(settings.manifest, settings.configmap)

            if (updatedResult.error) {
                throw new Error('Failed to save Mosquitto password configMap')
            }

            if (restart) {
                //kick the deployment for the new settings to take effect
                await DeploymentHelper.from(namespace, this.deploymentName).restartDeployment(this.cluster)
            }
        }

    }

    async removeUser(username: string, namespace: string, restart: boolean) {
        const settings = await this.readSettings(namespace)
        const found = settings.users.find(user => user.username === username) !== undefined
        if (found) {

            //filter the item from our array
            const users = settings.users.filter(item => item.username !== username)

            //join the reamining items and stuff them back into our config map
            settings.configmap.data['users.conf'] = users.map(item => `${item.username}:${item.password}`).join('\n').trim()

            //update our cluster/config map to reflect the change
            const updatedResult = await this.cluster.put(settings.manifest, settings.configmap)

            if (updatedResult.error) {
                throw new Error('Failed to save Mosquitto password configMap')
            }

            if (restart) {
                //kick the deployment for the new settings to take effect
                await DeploymentHelper.from(namespace, this.deploymentName).restartDeployment(this.cluster)
            }

        }
    }
}