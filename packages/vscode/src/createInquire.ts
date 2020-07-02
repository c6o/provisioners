import { baseProvisionerType } from './index'
import { promises as fs } from 'fs'
import { homedir } from 'os'
import * as path from 'path'

function resolvePath(filePath: string) {
    if (!filePath)
        return ''

    // '~/folder/path' or '~'
    if (filePath[0] === '~' && (filePath[1] === '/' || filePath.length === 1))
        return filePath.replace('~', homedir())

    return path.resolve(filePath)
}

export const createInquireMixin = (base: baseProvisionerType) => class extends base {

    storageChoices = ['1Gi','2Gi','5Gi','10Gi','20Gi','50Gi','100Gi']
    envChoices = ['node','go']

    async inquire(args) {
        const answers = {
            storageClass: args['storageClass'] || await this.getDefaultStorageClass(),
            storage: args['storage'],
            env: args['env']            
        }

        const responses = await this.manager.inquirer?.prompt([
            this.inquireStorageClass({
                name: 'storageClass'
            })
        ,{
            type: 'list',
            name: 'storage',
            message: 'What size data volume would you like for your log storage?',
            choices: this.storageChoices,
            default: this.spec.storage || '2Gi'
        }, {
            type: 'list',
            name: 'env',
            message: 'What environment do you want?',
            choices: this.envChoices,
            default: this.spec.env || 'node'
        }], answers)

        return responses
    }

    async createInquire(args) {
        const results = await this.inquire(args)

        this.spec.storageClass = results.storageClass
        this.spec.storage = results.storage
        this.spec.img =`traxitt/${results.env}-dev`
        
        if (!this.spec.publicKey) {
            this.spec.publicKey = await fs.readFile(resolvePath(this.pubKeyPath(results)), 'utf8')
            if (!this.spec.publicKey)
                throw new Error('publicKey is required')
        }

        this.spec.launch = !!this.spec.launch
    }

    pubKeyPath(answers) {
        return this.spec.keyFile || answers['pubKeyPath'] || '~/.ssh/id_rsa.pub'
    }
}