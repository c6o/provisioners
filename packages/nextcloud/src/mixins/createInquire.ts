import { baseProvisionerType } from '..'
import { merge } from 'lodash'

const enum DB_TYPES {
    SQLITE,
    MYSQL,
    REMOTE_SQL
}

export const createInquireMixin = (base: baseProvisionerType) => class extends base {

    storageChoices = ['1Gi','2Gi','5Gi','10Gi','20Gi','50Gi','100Gi']

    async inquire(args) {
        const answers = {
            storageClass: args['storageClass'] || await this.getDefaultStorageClass(),
            storage: args['storage'],
            hostname: args['hostname']
        }

        const responses = await this.manager.inquirer?.prompt([
            this.inquireStorageClass({
                name: 'storageClass'
            })
        ,{
            type: 'list',
            name: 'storage',
            message: 'What size data volume would you like for your NextCloud service?',
            choices: this.storageChoices,
            default: '2Gi'
        },{
            type: 'input',
            name: 'adminUsername',
            message: 'Set an initial admin username:',
            default: 'admin'
        },{
            type: 'password',
            name: 'adminPassword',
            message: 'Set an initial admin password:',
        },{
            type: 'list',
            name: 'dbtype',
            message: 'What database would you like to use?',
            choices: [
                { value: DB_TYPES.SQLITE, name: 'SQLite (no recommended for production)' },
                { value: DB_TYPES.MYSQL,  name: 'MySQL (Hosted)' },
                { value: DB_TYPES.REMOTE_SQL, name: 'Remote SQL' },
            ],
            default: DB_TYPES.MYSQL,
        },{
            when: ({dbtype}) => dbtype === DB_TYPES.REMOTE_SQL,
            type: 'input',
            name: 'sql.host',
            message: 'Remote MySQL host:',
        },{
            when: ({dbtype}) => dbtype === DB_TYPES.REMOTE_SQL,
            type: 'input',
            name: 'sql.port',
            message: 'Remote MySQL port:',
            default: 3306,
        },{
            when: ({dbtype}) => dbtype === DB_TYPES.REMOTE_SQL,
            type: 'input',
            name: 'sql.database',
            message: 'Remote MySQL database name:',
            default: "nextcloud",
        },{
            when: ({dbtype}) => dbtype === DB_TYPES.REMOTE_SQL,
            type: 'input',
            name: 'sql.username',
            message: 'Remote MySQL username:',
            default: "nextcloud",
        },{
            when: ({dbtype}) => dbtype === DB_TYPES.REMOTE_SQL,
            type: 'password',
            name: 'sql.password',
            message: 'Remote MySQL password:',
        }], answers)

        return responses
    }

    async createInquire(args) {
        const results = await this.inquire(args)

        // Ensure sql enabled and self hosted flags are set appropriately.
        if (!results.sql) results.sql = {}
        results.sql.enabled = results.dbtype === DB_TYPES.REMOTE_SQL || results.dbtype === DB_TYPES.MYSQL
        results.sql.selfHosted = results.dbtype === DB_TYPES.MYSQL

        // Merge new values, keep defaults if not set.
        this.spec = merge(this.spec, results);
    }
}