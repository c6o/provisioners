import { baseProvisionerType } from '..'

export const createInquireMixin = (base: baseProvisionerType) => class extends base {

    async inquire(args) {
        const answers = {
            storageClass: args['storageClass'] || await this.getDefaultStorageClass()
        }

        const responses = await this.manager.inquirer?.prompt([
            this.inquireStorageClass({
                name: 'storageClass'
            })], answers)

        return responses
    }

    async createInquire(args) {
        const results = await this.inquire(args)

        this.spec.storageClass = results.storageClass
    }
}