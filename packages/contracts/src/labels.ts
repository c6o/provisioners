import { Labels as KubeLabels } from '@c6o/kubeclient-contracts'

export class Labels extends KubeLabels {
    static valueManagedByC6O = 'codezero'
}