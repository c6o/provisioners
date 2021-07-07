import { CodeZeroHelper } from "../codezero"
import { StatefulSet } from '@c6o/kubeclient-resources/apps/v1'

export class StatefulSetHelper<T extends StatefulSet = StatefulSet>
    extends CodeZeroHelper<T> {

    static template = (namespace?: string, name?: string): StatefulSet => ({
        apiVersion: 'apps/v1',
        kind: 'StatefulSet',
        metadata: {
            ...(name ? { name } : undefined),
            ...(namespace ? { namespace } : undefined)
        }
    })

    static from = (namespace?: string, name?: string) =>
        new StatefulSetHelper(StatefulSetHelper.template(namespace, name))
}