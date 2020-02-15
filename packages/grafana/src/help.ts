import { baseProvisionerType } from './index'
import { optionFunctionType } from '@provisioner/common'

export const helpMixin = (base: baseProvisionerType) => class extends base {

    help(command: string, options: optionFunctionType, messages: string[]) {
        options('--storage', 'grafana: Storage to reserve for flow')
        options('--adminUsername', 'grafana: Administrator username')
        options('--adminPassword', 'grafana: Administrator password')

        messages.push('  Grafana Provisioner:')
        messages.push('    - The Grafana provisioner installs Grafana with provisioned storage')
        messages.push('\n')
    }
}