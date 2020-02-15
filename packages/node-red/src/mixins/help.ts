import { baseProvisionerType } from '../'
import { optionFunctionType } from '@provisioner/common'

export const helpMixin = (base: baseProvisionerType) => class extends base {

    help(command: string, options: optionFunctionType, messages: string[]) {
        options('--storage', 'node-red: Storage to reserve for flow')
        options('--projects', 'node-red: Enable or disable projects feature')

        messages.push('  Node-RED Provisioner:')
        messages.push('    - The Node-RED provisioner installs Node-RED with storage')
        messages.push('\n')
    }
}