import { baseProvisionerType } from '../index'
import { optionFunctionType } from '@provisioner/contracts'

export const helpMixin = (base: baseProvisionerType) => class extends base {

    help(command: string, options: optionFunctionType, messages: string[]) {
        options('--storage', 'grafana provision: Storage to reserve for flow')
        options('--adminUsername', 'grafana provision: Administrator username')
        options('--adminPassword', 'grafana provision: Administrator password')
        options('--force', 'grafana deprovision: force deprovision with added dashboards')

        messages.push('  Grafana Provisioner:')
        messages.push('    - The Grafana provisioner installs Grafana with provisioned storage')
        messages.push('\n')
    }
}