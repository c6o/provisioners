import { WorkloadKinds } from './types'


export const pathToContainers = (kind: WorkloadKinds) => {
    switch (kind) {
        case 'Pod':
            return '.spec.containers[*]'
        case 'Deployment':
        case 'StatefulSet':
        case 'Job':
            return '.spec.template.spec.containers[*]'
        case 'CronJob':
            return '.spec.jobTemplate.spec.template.spec.containers[*]'
    }
}


export const pathToEnv = (kind: WorkloadKinds) => `${pathToContainers(kind)}.env[*]`
export const pathToConfigMapRefs = (kind: WorkloadKinds) => `${pathToContainers(kind)}.envFrom[*].configMapRef[*]`
export const pathToSecretRefs = (kind: WorkloadKinds) => `${pathToContainers(kind)}.envFrom[*].secretRef[*]`