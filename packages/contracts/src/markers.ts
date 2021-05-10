import { Resource, setLabel, setAnnotation } from '@c6o/kubeclient-contracts'

const keyManagedBy = 'app.kubernetes.io/managed-by'

// Labels - searchable
export const setManagedBy = <R extends Resource = Resource>(resource: R, by = 'codezero') =>
    setLabel(resource, keyManagedBy, by)
export const isManagedBy = <R extends Resource = Resource>(resource: R, by = 'codezero') =>
    resource.metadata?.labels?.[keyManagedBy] === by


// Annotations - not searchable