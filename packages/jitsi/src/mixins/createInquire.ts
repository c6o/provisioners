import { baseProvisionerType } from '../index'

export const createInquireMixin = (base: baseProvisionerType) => class extends base {

    async createInquire(args) {

        const answers = {
            secret: args.secret || this.spec.secret,
            authPassword: args['auth-password'] || this.spec.authPassword,
            jvbPassword: args['jvb-password'] || this.spec.jvbPassword
        }

        const responses = await this.manager.inquirer?.prompt([
            {
                type: 'password',
                name: 'secret',
                message: 'JICOFO Component Secret:',
                validate: (secret) => (secret !== '' ? true : '')
            },
            {
                type: 'password',
                name: 'authPassword',
                message: 'JICOFO Auth Password:',
                validate: (authPassword) => (authPassword !== '' ? true : '')
            },
            {
                type: 'password',
                name: 'jvbPassword',
                message: 'JVB Auth Password:',
                validate: (jvbPassword) => (jvbPassword !== '' ? true : '')
            }
        ], answers)

        this.spec.secret = responses.secret
        this.spec.authPassword = responses.authPassword
        this.spec.jvbPassword = responses.jvbPassword

    }
}
