import { JSONPath } from 'jsonpath-plus'
import { WorkloadKind, WorkloadResource } from '@c6o/kubeclient-helpers'
import { keyValue } from '@c6o/kubeclient-contracts'
import {
    pathToConfigMapRefs,
    pathToEnv,
    pathToLabels,
    pathToSecretRefs,
    pathToVolumeMounts,
    pathToVolumes
} from './paths'
import { Volume, VolumeMount } from '@c6o/kubeclient-resources/lib/core/v1'

export type WorkloadOrArray = WorkloadResource | WorkloadResource[]

export class WorkloadHelper {

    static prefix = (workloads: WorkloadOrArray) => Array.isArray(workloads) ? '$[*]' : '$'

    static envToKeyValue(kind: WorkloadKind, workloads: WorkloadOrArray, merge: keyValue = {}): keyValue {
        const envPath = pathToEnv(kind)
        const path = `${WorkloadHelper.prefix(workloads)}${envPath}`
        const envs = JSONPath({ path, json: workloads })
        return envs.reduce((acc, env) => {
                acc[env.name] = env.value
                return acc
            }, merge)
    }

    static configMapRefs(kind: WorkloadKind, workloads: WorkloadOrArray) : string[] {
        const refsPath = pathToConfigMapRefs(kind)
        const path = `${WorkloadHelper.prefix(workloads)}${refsPath}`
        return JSONPath({ path, json: workloads })
    }

    static secretRefs(kind: WorkloadKind, workloads: WorkloadOrArray): string[] {
        const refsPath = pathToSecretRefs(kind)
        const path = `${WorkloadHelper.prefix(workloads)}${refsPath}`
        return JSONPath({ path, json: workloads })
    }

    static volumes(kind: WorkloadKind, workloads: WorkloadOrArray): Volume[] {
        const volumesPath = pathToVolumes(kind)
        const path = `${WorkloadHelper.prefix(workloads)}${volumesPath}`
        return JSONPath({ path, json: workloads })
    }

    static volumeMounts(kind: WorkloadKind, workloads: WorkloadOrArray): VolumeMount[] {
        const volumesPath = pathToVolumeMounts(kind)
        const path = `${WorkloadHelper.prefix(workloads)}${volumesPath}`
        return JSONPath({ path, json: workloads })
    }

    static labels(kind: WorkloadKind, workloads: WorkloadOrArray): {[name: string]: string} {
        const labelsPath = pathToLabels(kind)
        const path = `${WorkloadHelper.prefix(workloads)}${labelsPath}`
        const result = JSONPath({ path, json: workloads })
        return JSONPath({ path, json: workloads })['0']
    }
}