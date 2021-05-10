import inquirer from 'inquirer'
import { baseProvisionerType } from '../index'

export const createInquireMixin = (base: baseProvisionerType) => class extends base {

    async createInquire(args) {

        const answers = {
            username: args['username'] || this.spec.username,
            passkey: args['passkey'] || this.spec.passkey,
            teamNumber: args['team-number'] || this.spec.teamNumber
        }

        //https://apps.foldingathome.org/team
        const responses = await inquirer.prompt([
            {
                type: 'input',
                name: 'username',
                message: 'Username:',
                default: answers.username
            },
            {
                type: 'password',
                name: 'passkey',
                message: 'Pass Key: (32 hexadecimal characters if provided)',
                default: answers.passkey
            },
            {
                type: 'input',
                name: 'teamNumber',
                message: 'Team Number:',
                default: answers.teamNumber
            }
        ], answers)

        this.spec.username = responses.username
        this.spec.passkey = responses.passkey
        this.spec.teamNumber = responses.teamNumber

    }
}
