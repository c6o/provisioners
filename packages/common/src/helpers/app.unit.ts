
import { AppHelper } from './app'

describe('AppHelper', () => {

    describe('AppHelper static functions', () => {

        test('from template no namespace', async () => {
            const someValue = 'foo'
            const result = AppHelper.template(undefined, someValue)
            expect(result).toBeDefined()
            expect(result.metadata.name).toEqual(someValue)
            expect(result.metadata.namespace).toBeUndefined()
        })

        test('from template no name', async () => {
            const someValue = 'foo'
            const result = AppHelper.template(someValue)
            expect(result).toBeDefined()
            expect(result.metadata.namespace).toEqual(someValue)
            expect(result.metadata.name).toBeUndefined()
        })

        test('from template', async () => {
            const someValue = 'foo'
            const someOtherValue = 'bar'
            const result = AppHelper.template(someValue, someOtherValue)
            expect(result).toBeDefined()
            expect(result.metadata.namespace).toEqual(someValue)
            expect(result.metadata.name).toEqual(someOtherValue)
        })

    })
})
