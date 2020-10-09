
export function getLabels(name: string) {
    return {
        app: name,
        'app.kubernetes.io/managed-by': 'codezero',
        'system.codezero.io/app': name,
        'system.codezero.io/appengine': 'v1'
    }
}