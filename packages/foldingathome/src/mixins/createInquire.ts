import { baseProvisionerType } from '../index'

export const createInquireMixin = (base: baseProvisionerType) => class extends base {

    async createInquire(args) {

        const answers = {
            username: args.username || this.spec.username,
            passkey: args.passkey || this.spec.passkey,
            teamNumber: args.teamNumber || this.spec.teamNumber
        }

        const responses = await this.manager.inquirer?.prompt([
            {
                type: 'input',
                name: 'username',
                message: 'Username:',
                askAnswered: true,
            },
            {
                type: 'password',
                name: 'passkey',
                message: 'Pass Key: (32 hexadecimal characters if provided)',
                askAnswered: true,
            },
            {
                type: 'input',
                name: 'teamNumber',
                message: 'Team Number (https://apps.foldingathome.org/team):',
                askAnswered: true,
            }
        ], answers)

        this.spec.username = responses.username
        this.spec.passkey = responses.passkey
        this.spec.teamNumber = responses.teamNumber

    }
}
