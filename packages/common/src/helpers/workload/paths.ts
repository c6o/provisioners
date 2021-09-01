import { WorkloadKinds } from './types'

export const pathToSpec = (kind: WorkloadKinds) => {
    switch (kind) {
        case 'Pod':
            return '.spec'
        case 'Deployment':
        case 'StatefulSet':
        case 'Job':
            return '.spec.template.spec'
        case 'CronJob':
            return '.spec.jobTemplate.spec.template.spec'
    }
}

export const pathToContainers = (kind: WorkloadKinds) =>
    `${pathToSpec(kind)}.containers[*]`

export const pathToVolumes = (kind: WorkloadKinds) =>
    `${pathToSpec(kind)}.volumes[*]`

export const pathToVolumeMounts = (kind: WorkloadKinds) =>
    `${pathToContainers(kind)}.volumeMounts[*]`

export const pathToEnv = (kind: WorkloadKinds) => `${pathToContainers(kind)}.env[*]`
export const pathToConfigMapRefs = (kind: WorkloadKinds) => `${pathToContainers(kind)}.envFrom[*].configMapRef[*]`
export const pathToSecretRefs = (kind: WorkloadKinds) => `${pathToContainers(kind)}.envFrom[*].secretRef[*]`