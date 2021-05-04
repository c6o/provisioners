import { baseProvisionerType } from '../'
import { optionFunctionType } from '@provisioner/contracts'

export const helpMixin = (base: baseProvisionerType) => class extends base {

    help(command: string, options: optionFunctionType, messages: string[]) {
        options('--secret-key', 'mongo: Secret where database connection strings are stored')

        messages.push('  Mongo Provisioner:')
        messages.push('    - The mongo provisioner installs mongodb and creates databases as needed')
        messages.push('\n')
    }
}