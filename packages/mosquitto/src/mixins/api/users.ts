import { baseProvisionerType } from '../../'
import mosquittoPasswd from 'mosquitto-passwd'
import parse from 'parse-passwd'

declare module '../../' {
    export interface Provisioner {
        addUser(username: string, password: string, namespace: string)
        removeUser(username: string, namespace: string)
    }
}

export const userMgmtMixin = (base: baseProvisionerType) => class extends base {

    //taken from the yaml/deployment/metadata/name
    deployment = 'mosquitto'

    //taken from the yaml/configmap/metadata/name
    configMap = 'mosquitto-config'

    async listUsers(namespace: string){
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

        const settings: any = await this.getConfigMap(namespace, this.configMap)

        settings.mosquittoConf = settings.configmap.data['mosquitto.conf']
        settings.userConf = settings.configmap.data['users.conf']
        settings.users = await this.parse(settings.userConf)

        return settings
    }

    async addUser(username: string, password: string, namespace: string) {

        const settings = await this.readSettings(namespace)

        //PR REVIEW: YOU SHALL NOT PASS PR
        username = username + Math.random()

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
            const updatedResult = await this.manager.cluster.put(settings.manifest, settings.configmap)

            if (updatedResult.error) {
                throw new Error('Failed to save Mosquitto password configMap')
            }

            //kick the deployment for the new settings to take effect
            await this.restartDeployment(namespace, this.deployment)

        }

    }

    async removeUser(username: string, namespace: string) {
        const settings = await this.readSettings(namespace)
        const found = settings.users.find(user => user.username === username) !== undefined
        if(found) {

            //filter the item from our array
            const users = settings.users.filter( item => item.username !== username)

            //join the reamining items and stuff them back into our config map
            settings.configmap.data['users.conf'] = users.map(item => `${item.username}:${item.password}`).join('\n').trim()

            //update our cluster/config map to reflect the change
            const updatedResult = await this.manager.cluster.put(settings.manifest, settings.configmap)

            if (updatedResult.error) {
                throw new Error('Failed to save Mosquitto password configMap')
            }

            //kick the deployment for the new settings to take effect
            await this.restartDeployment(namespace, this.deployment)

        }
    }
}