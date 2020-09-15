import { baseProvisionerType } from '..'
import { Buffer } from 'buffer'

export const createInquireMixin = (base: baseProvisionerType) => class extends base {

    credentialsObjs = {auths:{'https://index.docker.io/v1/':{username: '',password:'',email:'',auth:''}}}

    toCredentials({username, password, email}) {

        const auth = Buffer.from(`${username}:${password}`).toString('base64')
        const credentials = JSON.stringify({auths:{'https://index.docker.io/v1/':{username,password,email,auth}}})

        return Buffer.from(credentials).toString('base64')
    }

    async inquire(args) {

        const answers = {
            storageClass: args['storageClass'] || await this.getDefaultStorageClass(),
            storage: args['storage'],
            edition: args['edition'],
            username: args['username'],
            password: args['password'],
            email: 'ignore@ignored.com' // docker no longer needs this but it needs to be in creds
        }

        const responses = await this.manager.inquirer.prompt([
            this.inquireStorageClass({
                name: 'storageClass'
            }),
            {
                type: 'input',
                name: 'storage',
                default: '2Gi',
                message: 'What size data volume would you like for PreCog?'
            }, {
                type: 'list',
                choices: ['evaluation', 'enterprise'],
                name: 'edition',
                message: 'Which edition would you like to install?',
                default: 0
            }, {
                type: 'input',
                name: 'username',
                message: 'What is your docker username?'
            }, {
                type: 'password',
                name: 'password',
                message: 'What is your docker password?'
            }], answers)

        return responses
    }

    async createInquire(args) {
        const results = await this.inquire(args)

        this.spec.storageClass = results.storageClass
        this.spec.edition = results.edition
        this.spec.storage = results.storage
        this.spec.credentials = this.toCredentials(results)
    }
}