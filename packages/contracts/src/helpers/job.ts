import { CodeZeroHelper } from "../codezero"
import { Job } from '@c6o/kubeclient-resources/batch/v1'

export class JobHelper<T extends Job = Job>
    extends CodeZeroHelper<T> {

    static template = (namespace?: string, name?: string): Job => ({
        apiVersion: 'batch/v1',
        kind: 'Job',
        metadata: {
            ...(name ? { name } : undefined),
            ...(namespace ? { namespace } : undefined)
        }
    })

    static from = (namespace?: string, name?: string) =>
        new JobHelper(JobHelper.template(namespace, name))
}