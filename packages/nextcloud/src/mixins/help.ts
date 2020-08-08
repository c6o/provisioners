import { baseProvisionerType } from '../'
import { optionFunctionType } from '@provisioner/common'

export const helpMixin = (base: baseProvisionerType) => class extends base {

    help(command: string, options: optionFunctionType, messages: string[]) {
        options('--storage', 'nextcloud: Storage to reserve for flow')
        options('--hostname', 'nextcloud: Hostname for your NextCloud service')

        messages.push('  NextCloud Provisioner:')
        messages.push('    - The NextCloud provisioner installs NextCloud with storage')
        messages.push('\n')
    }
}