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

    pubKeyPath(args) {
        return this.spec.keyFile || args['pubKeyPath'] || '~/.ssh/id_rsa.pub'
    }

    async createInquire(args) {

        const answers = {
            storage: args.storage || this.spec.storage || '4Gi',
        }

        const response = await this.manager.inquirer.prompt([{
            type: 'input',
            name: 'storage',
            default: '4Gi',
            message: 'What size data volume would you like for VSCode?',
            askAnswered: true
        }, {
            type: 'list',
            name: 'env',
            message: 'What environment do you want?',
            choices: ['node', 'go'],
            default: 0
        }], answers)

        this.spec.img = `traxitt/${response.env}-dev`

        if (!this.spec.publicKey) {
            this.spec.publicKey = await fs.readFile(resolvePath(this.pubKeyPath(args)), 'utf8')
            if (!this.spec.publicKey)
                throw new Error('publicKey is required')
        }

        this.spec.launch = !!this.spec.launch
    }
}