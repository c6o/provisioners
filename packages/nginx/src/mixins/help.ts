import { baseProvisionerType } from '../'
import { optionFunctionType } from '@provisioner/common'

export const helpMixin = (base: baseProvisionerType) => class extends base {

    help(command: string, options: optionFunctionType, messages: string[]) {
        messages.push('  Nginx Provisioner:')
        messages.push('    - The Nginx provisioner installs Nginx web server')
        messages.push('\n')
    }
}