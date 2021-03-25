import yaml from 'js-yaml'

export function getSecretValuesTemplate(name: string, namespace: string, data: any) {
    const values = yaml.dump(data)

    return {
        apiVersion: 'v1',
        kind: 'Secret',
        metadata: {
            name: `${name}-secret-values`,
            namespace: namespace
        },
        data: {
            'values.yaml': Buffer.from(values).toString('base64')
        }
    }
}