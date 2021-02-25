import { baseProvisionerType } from '..'

export const createInquireMixin = (base: baseProvisionerType) => class extends base {

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    async createInquire(answers) {
    }
}