import { CodeZeroHelper } from '../codezero'
import { CronJob } from '@c6o/kubeclient-resources/batch/v1beta1'

export class CronJobHelper<T extends CronJob = CronJob>
    extends CodeZeroHelper<T> {

    static template = (namespace?: string, name?: string): CronJob => ({
        apiVersion: 'batch/v1beta1',
        kind: 'CronJob',
        metadata: {
            ...(name ? { name } : undefined),
            ...(namespace ? { namespace } : undefined)
        }
    })

    static from = (namespace?: string, name?: string) =>
        new CronJobHelper(CronJobHelper.template(namespace, name))
}