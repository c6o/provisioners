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

export const preprovisionMixin = (base: baseProvisionerType) => class extends base {

    get providedStorageSetting() {
        return this.spec.storage || this.options['storage']
    }

    get providedDevEnvSetting() {
        return this.spec.env || this.options['env']
    }

    get pubKeyPath() {
        return this.spec.keyFile || this.options['pubKeyPath'] || '~/.ssh/id_rsa.pub'
    }

    async preprovision() {

        if (!this.providedStorageSetting) {
            const response = await this.manager.inquirer?.prompt({
                type: 'input',
                name: 'storage',
                default: '4Gi',
                message: 'What size /data volume would you like?'
            })

            if (response)
                this.spec.storage = response.storage
            else
                this.spec.storage = '4Gi'
        } else this.spec.storage =this.providedStorageSetting
    
        let devEnv:string
        if (!this.providedDevEnvironment) {

            const response = await this.manager.inquirer?.prompt({
                type: 'list',
                name: 'env',
                message: 'What environment do you want?',
                choices: ['node','go'],
                default: 0
            })

            if (response)
                devEnv = response.env
            else
                devEnv = 'node'

        }
        this.spec.img =`traxitt/${devEnv}-dev`

        if (!this.spec.publicKey) {
            this.spec.publicKey = await fs.readFile(resolvePath(this.pubKeyPath), 'utf8')
            if (!this.spec.publicKey)
                throw new Error('publicKey is required')
        }

        this.spec.launch = !!this.spec.launch

    }
}