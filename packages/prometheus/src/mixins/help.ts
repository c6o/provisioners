import { baseProvisionerType } from '..'
import { optionFunctionType } from '@provisioner/contracts'

export const helpMixin = (base: baseProvisionerType) => class extends base {

    help(command: string, options: optionFunctionType, messages: string[]) {
        messages.push('  Prometheus Provisioner:')
        messages.push('    - The Prometheus provisioner installs Prometheus to monitor the cluster and other metrics')
        messages.push('\n')
    }
}