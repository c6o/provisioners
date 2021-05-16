import { createApplyMixin } from './createApplyMixin'
import { baseProvisionerType, Provisioner } from '../index'
import { Controller } from '../../../contracts/lib'

describe('Ghost Mixins', () => {
    const GhostProvisioner = createApplyMixin(Provisioner as baseProvisionerType)
    const someName = 'A Name'
    let res, resBegin, resBeginWatch, resWhenWatch, resEndWatch, resAddOwner, resUpsertFile, resEnd
    const setUpCluster = () => {
        resBegin = jest.fn()
        resBeginWatch = jest.fn()
        resWhenWatch = jest.fn()
        resEndWatch = jest.fn()
        resAddOwner = jest.fn()
        resUpsertFile = jest.fn()
        resEnd = jest.fn()
        res = {
            begin: resBegin,
            beginWatch: resBeginWatch,
            whenWatch: resWhenWatch,
            endWatch: resEndWatch,
            addOwner: resAddOwner,
            upsertFile: resUpsertFile,
            end: resEnd,
        }
        resBegin.mockImplementation(() => res)
        resBeginWatch.mockImplementation(() => res)
        resWhenWatch.mockImplementation(() => res)
        resEnd.mockImplementation(() => res)
        resAddOwner.mockImplementation(() => res)
        resUpsertFile.mockImplementation(() => res)
        return res
    }

    const setServiceNameSpace = (object) => {
        Object.defineProperty(object, 'serviceNamespace',
            {
                get: jest.fn(() => someName),
                set: jest.fn(),
            })
    }

    test('Create Ghost Provisioner', async () => {
        expect(GhostProvisioner).toBeDefined()
        expect(typeof GhostProvisioner).toEqual('function')
    })

    test('Ghost get pods', () => {
        const ghostProvisioner = new GhostProvisioner()
        setServiceNameSpace(ghostProvisioner)
        expect(ghostProvisioner.ghostPods).toEqual({
            'kind': 'Pod',
            'metadata': {
                'labels': {
                    'app': 'ghost'
                },
                'namespace': 'A Name',
            }
        })
    })

    test('createApply', async () => {
        const ghostProvisioner = new GhostProvisioner()
        ghostProvisioner.installGhost = jest.fn()
        ghostProvisioner.ensureGhostIsRunning = jest.fn()
        await ghostProvisioner.createApply()
        expect(ghostProvisioner.installGhost).toHaveBeenCalled()
        expect(ghostProvisioner.ensureGhostIsRunning).toHaveBeenCalled()
    })

    test('installGhost', async () => {
        const ghostProvisioner = new GhostProvisioner()
        ghostProvisioner.serviceName = someName
        setServiceNameSpace(ghostProvisioner)
        ghostProvisioner.controller = {
            cluster: setUpCluster(),
            resource: someName,
        } as any as Controller
        /* TODO: The following is not correct. Cluster and Processor are confused
        ghostProvisioner.controller.cluster.whenWatch.mockImplementation((conditionFun, processorFun) => {
            processorFun(res)
            return res
        })
        await ghostProvisioner.installGhost()
        expect(ghostProvisioner.controller.cluster.begin).toBeCalledTimes(2)
        expect(ghostProvisioner.controller.cluster.addOwner.mock.calls[0][0]).toEqual(someName)
        expect(ghostProvisioner.controller.cluster.upsertFile.mock.calls[0][0]).toEqual('../../k8s/latest/1-deployment.yaml')
        expect(ghostProvisioner.controller.cluster.upsertFile.mock.calls[0][1]).toEqual({namespace: someName})
        expect(ghostProvisioner.controller.cluster.addOwner.mock.calls[1][0]).toEqual(someName)
        expect(ghostProvisioner.controller.cluster.upsertFile.mock.calls[1][0]).toEqual('../../k8s/latest/2-service.yaml')
        expect(ghostProvisioner.controller.cluster.upsertFile.mock.calls[1][1]).toEqual({namespace: someName})
        expect(ghostProvisioner.controller.cluster.end).toBeCalledTimes(2)
        */
    })

    test('ensureGhostIsRunning', async () => {
        const ghostProvisioner = new GhostProvisioner()
        setServiceNameSpace(ghostProvisioner)
        ghostProvisioner.controller = {
            cluster: setUpCluster()
        } as any as Controller

        /* TODO: The following is not correct. Cluster and Processor are confused
        ghostProvisioner.controller.cluster.whenWatch.mockImplementation((conditionFun, processorFun) => {
            processorFun(res)
            return res
        })

        await ghostProvisioner.ensureGhostIsRunning()
        expect(ghostProvisioner.controller.cluster.begin).toBeCalled()
        expect(ghostProvisioner.controller.cluster.beginWatch).toBeCalledWith(ghostProvisioner.ghostPods)
        expect(ghostProvisioner.controller.cluster.whenWatch).toBeCalled()
        expect(ghostProvisioner.controller.cluster.endWatch).toBeCalled()
        expect(ghostProvisioner.controller.cluster.end).toBeCalled()
        */
    })
})
