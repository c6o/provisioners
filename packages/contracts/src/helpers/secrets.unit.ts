import { getSecretTemplate } from "./secrets"
import {SecretHelper} from "./secret";

describe('SecretHelper', () => {
    const some_name = 'name'
    const some_namespace = 'namespace'
    const some_data = { data: 'data' }

    test('SecretHelper.template(some_name, some_namespace, some_data))', () => {
        expect(getSecretTemplate(some_name, some_namespace, some_data))
            .toEqual({
                apiVersion: 'v1',
                kind: 'Secret',
                metadata: {
                    name: `${some_name}-secret`,
                    namespace: some_namespace
                },
                type: 'Opaque',
                data: some_data
            })
    })


    test('SecretHelper.template(undefined, some_namespace, some_data)', () => {
        expect(SecretHelper.template(undefined, some_namespace, some_data))
            .toEqual({
                apiVersion: 'v1',
                kind: 'Secret',
                metadata: {
                    namespace: some_namespace
                },
                type: 'Opaque',
                data: some_data
            })
    })

    test('SecretHelper.template(some_name, some_namespace, undefined)', () => {
        expect(SecretHelper.template(some_name, some_namespace, undefined))
            .toEqual({
                apiVersion: 'v1',
                kind: 'Secret',
                metadata: {
                    name: `${some_name}-secret`,
                    namespace: some_namespace
                },
                type: 'Opaque',
            })
    })

    test('SecretHelper.template(undefined, some_namespace, undefined)', () => {
        expect(SecretHelper.template(undefined, some_namespace, undefined))
            .toEqual({
                apiVersion: 'v1',
                kind: 'Secret',
                metadata: {
                    namespace: some_namespace
                },
                type: 'Opaque',
            })
    })


})