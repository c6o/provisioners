import { baseProvisionerType } from '../'

export const createValidateMixin = (base: baseProvisionerType) => class extends base {

    async createValidate() {
        const {
            applicationName,
            adminUsername,
            adminPassword,
            sql = {} } = this.spec

        if (!applicationName)
            throw new Error('Application name cannot be empty!')

        if(!adminUsername)
            throw new Error('Admin username is required.')

        if(!adminPassword)
            throw new Error('Admin password cannot be blank.')

        if(sql.enabled) {
            if (!sql.database)
                throw new Error('SQL database name cannot be blank.')

            if (!sql.selfHosted) {
                if(!sql.username)
                    throw new Error('SQL username cannot be blank, when using a remote SQL server.')
                if(!sql.password)
                    throw new Error('SQL password cannot be blank, when using a remote SQL server.')
                if(!sql.host)
                    throw new Error('SQL host cannot be blank, when using a remote SQL server.')
                if(!sql.port)
                    throw new Error('SQL port cannot be blank, when using a remote SQL server.')
            }
        }
    }
}