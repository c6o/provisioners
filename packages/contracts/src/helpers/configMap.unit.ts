import { ConfigMapHelper } from './configMap'

describe('ConfigMapHelper', () => {
    const some_name = 'name'
    const some_namespace = 'namespace'
    const some_data = { data: 'data' }

    test('ConfigMapHelper.template(some_name, some_namespace, some_data)', () => {
        expect(ConfigMapHelper.template(some_name, some_namespace, some_data))
            .toEqual({
                apiVersion: 'v1',
                kind: 'ConfigMap',
                metadata: {
                    name: some_name,
                    namespace: some_namespace
                },
                data: some_data
            })
    })

    test('ConfigMapHelper.template(undefined, some_namespace, some_data)', () => {
        expect(ConfigMapHelper.template(undefined, some_namespace, some_data))
            .toEqual({
                apiVersion: 'v1',
                kind: 'ConfigMap',
                metadata: {
                    namespace: some_namespace
                },
                data: some_data
            })
    })

    test('ConfigMapHelper.template(some_name, some_namespace, undefined)', () => {
        expect(ConfigMapHelper.template(some_name, some_namespace, undefined))
            .toEqual({
                apiVersion: 'v1',
                kind: 'ConfigMap',
                metadata: {
                    name: some_name,
                    namespace: some_namespace
                },
            })
    })

    test('ConfigMapHelper.template(undefined, some_namespace, undefined)', () => {
        expect(ConfigMapHelper.template(undefined, some_namespace, undefined))
            .toEqual({
                apiVersion: 'v1',
                kind: 'ConfigMap',
                metadata: {
                    namespace: some_namespace
                },
            })
    })

})