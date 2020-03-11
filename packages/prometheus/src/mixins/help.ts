import { baseProvisionerType } from '..'
import { optionFunctionType } from '@provisioner/common'

export const helpMixin = (base: baseProvisionerType) => class extends base {

    help(command: string, options: optionFunctionType, messages: string[]) {
        // options('--storage', 'node-red: Storage to reserve for flow')
        // options('--projects', 'node-red: Enable or disable projects feature')

        messages.push('  Prometheus Provisioner:')
        messages.push('    - The Prometheus provisioner installs Prometheus to monitor the cluster')
        messages.push('\n')
    }
}