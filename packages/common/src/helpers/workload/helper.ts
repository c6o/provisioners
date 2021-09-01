import { JSONPath } from 'jsonpath-plus'
import { keyValue } from '@c6o/kubeclient-contracts'
import {pathToConfigMapRefs, pathToEnv, pathToSecretRefs, pathToVolumeMounts, pathToVolumes} from './paths'
import {  WorkloadKinds, WorkloadResource } from './types'
import {Volume, VolumeMount} from "@c6o/kubeclient-resources/lib/core/v1";

export type WorkloadOrArray = WorkloadResource | WorkloadResource[]

export class WorkloadHelper {

    static prefix = (workloads: WorkloadOrArray) => Array.isArray(workloads) ? '$[*]' : '$'

    static envToKeyValue(kind: WorkloadKinds, workloads: WorkloadOrArray, merge: keyValue = {}): keyValue {
        const envPath = pathToEnv(kind)
        const path = `${WorkloadHelper.prefix(workloads)}${envPath}`
        const envs = JSONPath({ path, json: workloads })
        return envs.reduce((acc, env) => {
                acc[env.name] = env.value
                return acc
            }, merge)
    }

    static configMapRefs(kind: WorkloadKinds, workloads: WorkloadOrArray) : string[] {
        const refsPath = pathToConfigMapRefs(kind)
        const path = `${WorkloadHelper.prefix(workloads)}${refsPath}`
        return JSONPath({ path, json: workloads })
    }

    static secretRefs(kind: WorkloadKinds, workloads: WorkloadOrArray): string[] {
        const refsPath = pathToSecretRefs(kind)
        const path = `${WorkloadHelper.prefix(workloads)}${refsPath}`
        return JSONPath({ path, json: workloads })
    }

    static volumes(kind: WorkloadKinds, workloads: WorkloadOrArray): Volume[] {
        const volumesPath = pathToVolumes(kind)
        const path = `${WorkloadHelper.prefix(workloads)}${volumesPath}`
        return JSONPath({ path, json: workloads })
    }

    static volumeMounts(kind: WorkloadKinds, workloads: WorkloadOrArray): VolumeMount[] {
        const volumesPath = pathToVolumeMounts(kind)
        const path = `${WorkloadHelper.prefix(workloads)}${volumesPath}`
        return JSONPath({ path, json: workloads })
    }
}