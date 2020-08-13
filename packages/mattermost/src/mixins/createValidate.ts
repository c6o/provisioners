import { baseProvisionerType } from '../index'

export const createValidateMixin = (base: baseProvisionerType) => class extends base {

    async createValidate() {
        if (!this.isPreview) {
            const {
                users,
                databaseStorageSize,
                minioStorageSize
            } = this.spec

            if (!users)
                throw new Error('Number of users is required')

            if (!databaseStorageSize)
                throw new Error('The database storage size is required')

            if (!minioStorageSize)
                throw new Error('The storage size for media files is required')
        }
    }
}
