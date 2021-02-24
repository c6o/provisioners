import { Provisioner } from './index'

describe('Ghost index file', () => {
    test('isLastest return "latest"', async () => {
        const provisioner = new Provisioner()
        expect(provisioner.isLatest).toBeDefined()
        expect(provisioner.isLatest).toEqual(false)
    })
})
