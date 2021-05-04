import { baseProvisionerType } from '../'
import { optionFunctionType } from '@provisioner/contracts'

export const helpMixin = (base: baseProvisionerType) => class extends base {

    help(command: string, options: optionFunctionType, messages: string[]) {
        options('--secret-key', 'mysql: Secret where database connection strings are stored')

        messages.push('  Mysql Provisioner:')
        messages.push('    - The mysql provisioner installs mysql and creates databases as needed')
        messages.push('\n')
    }
}