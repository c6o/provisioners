import { baseProvisionerType } from './'

export const createValidateMixin = (base: baseProvisionerType) => class extends base {
	async createValidate() {
		this.spec.storage = this.spec.storage || '4Gi'
		this.spec.img = this.spec.img || 'traxitt/node-dev'
		if (!this.spec.publicKey)
			throw Error('A public key must be provided')
	}
}