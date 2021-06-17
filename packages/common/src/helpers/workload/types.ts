import { Pod } from '@c6o/kubeclient-resources/core/v1'
import { Deployment, StatefulSet } from '@c6o/kubeclient-resources/apps/v1'
import { Job, CronJob } from '@c6o/kubeclient-resources/batch/v1'

export type WorkloadKinds = 'Pod' | 'Deployment' | 'Job' | 'CronJob' | 'StatefulSet'
export type WorkloadTypes = Pod | Deployment | Job | CronJob | StatefulSet