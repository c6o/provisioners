import { baseProvisionerType } from '../'
import { optionFunctionType } from '@provisioner/common'

export const helpMixin = (base: baseProvisionerType) => class extends base {

    help(command: string, options: optionFunctionType, messages: string[]) {
        options('--storage', 'logging: Persistent volume storage to reserve for logs')

        messages.push('  Logging Provisioner:')
        messages.push('    - The logging provisioner installs logging with log persistent volume storage')
        messages.push('\n')
    }
}