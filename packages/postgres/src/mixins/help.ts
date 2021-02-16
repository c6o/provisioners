import { baseProvisionerType } from '../'
import { optionFunctionType } from '@provisioner/common'

export const helpMixin = (base: baseProvisionerType) => class extends base {

    help(command: string, options: optionFunctionType, messages: string[]) {
        options('--secret-key', 'postgres: Secret where database connection strings are stored')

        messages.push('  postgres Provisioner:')
        messages.push('    - The postgres provisioner installs postgres and creates databases as needed')
        messages.push('\n')
    }
}