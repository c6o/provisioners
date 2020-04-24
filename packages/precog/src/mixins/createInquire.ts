import { baseProvisionerType } from '..'
import { Buffer } from 'buffer'

export const createInquireMixin = (base: baseProvisionerType) => class extends base {

    credentialsObjs = {auths:{'https://index.docker.io/v1/':{username: '',password:'',email:'',auth:''}}}

    toCredentials({username, password, email}) {

        const auth = Buffer.from(`${username}:${password}`).toString('base64')
        const credentials = JSON.stringify({auths:{'https://index.docker.io/v1/':{username,password,email,auth}}})

        return Buffer.from(credentials).toString('base64')
    }

    async createInquire(options) {

        const answers = {
            storage: options.storage || this.spec.storage || '1Gi',
            email: 'ignore@ignored.com' // Docker no longer needs this but it needs to be in creds
        }

        const response = await this.manager.inquirer.prompt([{
            type: 'input',
            name: 'storage',
            default: '2Gi',
            message: 'What size data volume would you like for PreCog?',
            askAnswered: true
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


        this.spec.edition = response.edition
        this.spec.storage = response.storage
        this.spec.credentials = this.toCredentials(response)
    }
}