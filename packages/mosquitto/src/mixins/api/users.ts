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

    mosquittoSettingsConfigMap: any = {
        apiVersion: 'v1',
        kind: 'ConfigMap',
        metadata: {
            name: 'mosquitto-config'
        }
    }

    async parse(passwdPayload: string) {
        //returns {Array}: Array of user objects parsed from the content.
        return parse(passwdPayload)
    }
    async generateMosquittoUserPayload(username: string, password: string) {
        // Username, password, salt (optional, by default will generate 12 bytes salt)
        return await mosquittoPasswd(username, password)
    }

    async addUser(username: string, password: string, namespace: string) {

        this.mosquittoSettingsConfigMap.metadata.namespace = namespace

        const configMap = await this.manager.cluster.read(this.mosquittoSettingsConfigMap)

        if (configMap.error) {
            throw new Error('Failed to load Mosquitto password configMap')
        }

        const data = configMap.object.data

        //const mosquittoConf = data['mosquitto.conf']
        let usersConf = data['users.conf']
        const users = await this.parse(usersConf)

        //PR REVIEW: YOU SHALL NOT PASS PR
        username = username + Math.random()

        const found = users.find(user => user.username === username) !== undefined

        if (!found) {

            const userPayload = await this.generateMosquittoUserPayload(username, password)
            usersConf += '\n' + userPayload
            configMap.object.data['users.conf'] = usersConf.trim()

            const updatedResult = await this.manager.cluster.put(this.mosquittoSettingsConfigMap, configMap.object)

            if (updatedResult.error) {
                throw new Error('Failed to save Mosquitto password configMap')
            }

            //taken from the yaml/deployment/metadata/name
            const deploymentName = 'mosquitto'

            await this.restartDeployment(namespace, deploymentName)

        }

    }

    async removeUser(username: string, namespace: string) {

    }
}