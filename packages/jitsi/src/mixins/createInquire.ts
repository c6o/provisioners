import { baseProvisionerType } from '../index'

export const createInquireMixin = (base: baseProvisionerType) => class extends base {

    async createInquire(args) {

        const answers = {
            secret: args.secret || this.spec.secret,
            authPassword: args.authPassword || this.spec.authPassword,
            jvbPassword: args.jvbPassword || this.spec.jvbPassword
        }

        const responses = await this.manager.inquirer?.prompt([
            {
                type: 'password',
                name: 'secret',
                message: 'JICOFO Component Secret:',
                askAnswered: true,
                validate: (secret) => (secret !== '' ? true : '')
            },
            {
                type: 'password',
                name: 'authPassword',
                message: 'JICOFO Auth Password:',
                askAnswered: true,
                validate: (authPassword) => (authPassword !== '' ? true : '')
            },
            {
                type: 'password',
                name: 'jvbPassword',
                message: 'JVB Auth Password:',
                askAnswered: true,
                validate: (jvbPassword) => (jvbPassword !== '' ? true : '')
            }
        ], answers)

        this.spec.secret = responses.secret
        this.spec.authPassword = responses.authPassword
        this.spec.jvbPassword = responses.jvbPassword

    }
}
