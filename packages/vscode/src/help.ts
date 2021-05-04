import { baseProvisionerType } from './index'
import { optionFunctionType } from '@provisioner/contracts'

export const helpMixin = (base: baseProvisionerType) => class extends base {

    help(command: string, options: optionFunctionType, messages: string[]) {
        options('--keep-ip', 'vscode deprovision: Keep IP address')
        options('--keep-vol', 'vscode deprovision: Keep volume')

        messages.push('  VS Code Provisioner:')
        messages.push('    - The VS Code provisioner installs VS Code for in cluster development')
        messages.push('\n')
    }
}