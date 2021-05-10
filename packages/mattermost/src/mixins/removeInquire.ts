import inquirer from 'inquirer'
import { baseProvisionerType } from '../index'

export const removeInquireMixin = (base: baseProvisionerType) => class extends base {

    async removeInquire(args) {

        // TODO: Implement keep - not sure if we can actually keep the data
        // https://github.com/c6o/provisioners/issues/25
        const answers = {
            keepDatabase: this.spec.keepDatabase || args['keep-db'],
            keepMino: this.spec.keepMinio || args['keep-minio']
        }

        const response = await inquirer.prompt([
            {
            type: 'confirm',
            name: 'keepDatabase',
            default: false,
            message: 'Keep the database?',
        },
        {
            type: 'confirm',
            name: 'keepMino',
            default: false,
            message: 'Keep all media files?',
        }], answers)

        this.spec.keepDatabase = response.keepDatabase
        this.spec.keepMino = response.keepMino
    }
}