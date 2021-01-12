import { createInquireMixin } from './createInquire'
import { baseProvisionerType, Provisioner } from '../index'
import { inspect } from "util";
const testConfigSecrets = {
    config: {
        inquireKey: 1
    },
    secret: {
        secretKey: 2
    },
}
jest.mock('../flow', () => {
    return {
        FlowProcessor: function() {
            return {
                process: jest.fn().mockResolvedValue({
                    config: {
                        inquireKey: 1
                    },
                    secret: {
                        secretKey: 2
                    },
                })
            }
        },
    }
})

describe('App Engine Create Inquire', () => {
    const AppEngine = createInquireMixin(Provisioner as baseProvisionerType)

    test('Create App Engine Provisioner', async () => {
        expect(AppEngine).toBeDefined()
        expect(typeof AppEngine).toEqual('function')
    })
    const some_args = {}

    describe('App Engine createInquire', () => {
        test('App Engine: isNumeric NaN', async () => {
            const appEngine: Provisioner = new AppEngine()
            expect(appEngine.isNumeric(NaN)).toBeFalsy()
        })
        test('App Engine: isNumeric string', async () => {
            const appEngine: Provisioner = new AppEngine()
            expect(appEngine.isNumeric("1")).toBeTruthy()
            expect(appEngine.isNumeric("-1")).toBeTruthy()
            expect(appEngine.isNumeric("1a")).toBeFalsy()
            expect(appEngine.isNumeric("a")).toBeFalsy()
            expect(appEngine.isNumeric("a1")).toBeFalsy()
            expect(appEngine.isNumeric("[1]")).toBeFalsy()
            expect(appEngine.isNumeric("One")).toBeFalsy()
            expect(appEngine.isNumeric("{1:1}")).toBeFalsy()
        })
        test('App Engine: isNumeric number', async () => {
            const appEngine: Provisioner = new AppEngine()
            expect(appEngine.isNumeric(1)).toBeTruthy()
            expect(appEngine.isNumeric(-1)).toBeTruthy()
        })
        test('App Engine: isNumeric object or array', async () => {
            const appEngine: Provisioner = new AppEngine()
            expect(appEngine.isNumeric({q:1})).toBeFalsy()
            expect(appEngine.isNumeric({})).toBeFalsy()
            expect(appEngine.isNumeric({1:1})).toBeFalsy()
            expect(appEngine.isNumeric([1,2])).toBeFalsy()
            expect(appEngine.isNumeric([])).toBeFalsy()
        })
    })

    describe('App Engine createInquire', () => {

        test('App Engine: createInquire, no spec', async () => {
            const appEngine: Provisioner = new AppEngine()
            const no_spec_doc = { document: {} }
            appEngine.manager = no_spec_doc as any
            const result = await appEngine.createInquire(some_args)
            expect(result).toBeUndefined()
        })

        test('App Engine: createInquire, no steps', async () => {
            const appEngine: Provisioner = new AppEngine()
            const provisionerMock = jest.fn()
            const no_steps_doc = { document: { spec: { provisioner: provisionerMock } } }
            appEngine.manager = no_steps_doc as any
            const result = await appEngine.createInquire(some_args)
            expect(result).toBeUndefined()
        })

        test('App Engine: createInquire, steps', async () => {
            const appEngine: Provisioner = new AppEngine()
            const provisionerMock = {
                config: {
                    key1: 'key1'
                },
                secret: {
                    key2: 'key2'
                },
                steps: { something: 1 },
            }
            const no_steps_doc = { document: { spec: {
                provisioner: provisionerMock,
            } } }
            appEngine.manager = no_steps_doc as any
            await expect(async () => await appEngine.createInquire(some_args)).rejects.toThrow(
                `NOT IMPLEMENTED ${inspect({
                    config: { ...provisionerMock.config, ...testConfigSecrets.config },
                    secret: { ...provisionerMock.secret, ...testConfigSecrets.secret },
                    steps: provisionerMock.steps,
                })}`)
        })
    })
})