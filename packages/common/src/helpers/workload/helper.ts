import { JSONPath } from 'jsonpath-plus'
import { keyValue } from '@c6o/kubeclient-contracts'
import { pathToConfigMapRefs, pathToEnv, pathToSecretRefs } from './paths'
import {  WorkloadKinds, WorkloadTypes } from './types'

export type WorkloadOrArray = WorkloadTypes | WorkloadTypes[]

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
}