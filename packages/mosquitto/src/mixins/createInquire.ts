import { baseProvisionerType } from '../index'

export const createInquireMixin = (base: baseProvisionerType) => class extends base {

    async createInquire(args) {

        const answers = {
            username: args.username || this.spec.username,
            password: args.password || this.spec.password
        }

        const responses = await this.manager.inquirer?.prompt([
            {
                type: 'input',
                name: 'username',
                message: 'Username:',
                askAnswered: true,
                validate: (username) => (username !== '' ? true : '')
            },
            {
                type: 'password',
                name: 'password',
                message: 'Password:',
                askAnswered: true,
                validate: (password) => (password !== '' ? true : '')
            }
        ], answers)

        this.spec.username = responses.username
        this.spec.password = responses.password

    }
}
