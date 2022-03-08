import { WorkloadKind } from '@c6o/kubeclient-contracts'

export const pathToSpec = (kind: WorkloadKind) => {
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
export const pathToContainers = (kind: WorkloadKind) => `${pathToSpec(kind)}.containers[*]`
export const pathToVolumes = (kind: WorkloadKind) => `${pathToSpec(kind)}.volumes[*]`
export const pathToVolumeMounts = (kind: WorkloadKind) => `${pathToContainers(kind)}.volumeMounts[*]`
export const pathToEnv = (kind: WorkloadKind) => `${pathToContainers(kind)}.env[*]`
export const pathToConfigMapRefs = (kind: WorkloadKind) => `${pathToContainers(kind)}.envFrom[*].configMapRef[*]`
export const pathToSecretRefs = (kind: WorkloadKind) => `${pathToContainers(kind)}.envFrom[*].secretRef[*]`

export const pathToMetadata = (kind: WorkloadKind) => {
    switch (kind) {
        case 'Pod':
            return '.metadata'
        case 'Deployment':
        case 'StatefulSet':
        case 'Job':
            return '.spec.template.metadata'
        case 'CronJob':
            return '.spec.jobTemplate.spec.template.metadata'
    }
}
export const pathToLabels = (kind: WorkloadKind) => `${pathToMetadata(kind)}.labels`
