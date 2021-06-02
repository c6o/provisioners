import {SecretHelper} from './secret'

describe('SecretHelper', () => {
    const some_name = 'name'
    const some_namespace = 'namespace'
    const some_data = { data: 'data' }

    test('SecretHelper.template(some_namespace, some_name, some_data))', () => {
        expect(SecretHelper.template(some_namespace, some_name, some_data))
            .toEqual({
                apiVersion: 'v1',
                kind: 'Secret',
                metadata: {
                    name: `${some_name}`,
                    namespace: some_namespace
                },
                data: some_data
            })
    })


    test('SecretHelper.template(some_namespace, undefined, some_data)', () => {
        expect(SecretHelper.template(some_namespace, undefined, some_data))
            .toEqual({
                apiVersion: 'v1',
                kind: 'Secret',
                metadata: {
                    namespace: some_namespace
                },
                data: some_data
            })
    })

    test('SecretHelper.template(some_namespace, some_name, undefined)', () => {
        expect(SecretHelper.template(some_namespace, some_name, undefined))
            .toEqual({
                apiVersion: 'v1',
                kind: 'Secret',
                metadata: {
                    name: `${some_name}`,
                    namespace: some_namespace
                },
            })
    })

    test('SecretHelper.template(some_namespace, undefined, undefined)', () => {
        expect(SecretHelper.template(some_namespace, undefined, undefined))
            .toEqual({
                apiVersion: 'v1',
                kind: 'Secret',
                metadata: {
                    namespace: some_namespace
                },
            })
    })


})