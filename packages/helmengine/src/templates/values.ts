import yaml from 'js-yaml'

export async function getValuesTemplate(name: string, namespace: string, data: any) {
    let values = yaml.dump(data)

    return {
        apiVersion: 'v1',
        kind: 'ConfigMap',
        metadata: {
            name: `${name}-values`,
            namespace: namespace
        },
        data: {
            'values.yaml': values
        }
    }
}