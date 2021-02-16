import { baseProvisionerType } from '../'
import { optionFunctionType } from '@provisioner/common'

export const helpMixin = (base: baseProvisionerType) => class extends base {

    help(command: string, options: optionFunctionType, messages: string[]) {
        options('--secret-key', 'mariadb: Secret where database connection strings are stored')

        messages.push('  Mysql Provisioner:')
        messages.push('    - The mariadb provisioner installs mariadb and creates databases as needed')
        messages.push('\n')
    }
}