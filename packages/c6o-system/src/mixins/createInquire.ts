import { baseProvisionerType } from '../'

const inquireNewClusterId = '** new cluster **'

export const createInquireMixin = (base: baseProvisionerType) => class extends base {
    clusters
    accounts

    findCluster = (id) => this.clusters.find(cluster => cluster._id === id)
    findAccount = (id) => this.accounts.find(account => account._id === id)

    clusterIdWhen = async (answers) => {
        if (this.clusters.length === 0) {
            // There are no clusters to choose. Force the user to create a new one
            answers.clusterId = inquireNewClusterId
            return false
        }
        return true
    }

    clusterIdChoices = async () => {
        const choices = this.clusters.map(cluster => ({ name: cluster.name || cluster.namespace, value: cluster._id }))
        const newCluster = { name: 'New cluster', value: inquireNewClusterId }
        choices.unshift(newCluster, new this.manager.inquirer.Separator())
        return choices
    }

    newClusterWhen = async (answers) => answers.clusterId === inquireNewClusterId
    accountIdChoices = _ => this.accounts.map(account => ({ name: account.name, value: account._id }))

    async inquire(args) {
        this.clusters = await this.manager.hubClient.getClusters()
        this.accounts = await this.manager.hubClient.getAccounts()

        const answers = {
            protocol: args['proto'],
            env: args['staging'],
            clusterId: args['id'],
            clusterDomain: args['domain'],
            accountName: args['account'],
            noAccountName: args['no-account'],
            clusterName: args['name'],
            clusterNamespace: args['namespace'],
            clusterKey: args['key'],
            tag: args['tag']
        }

        if (!this.manager.hubClient || !this.manager.inquirer)
            return answers

        const responses = await this.manager.inquirer?.prompt([{
            type: 'list',
            name: 'clusterId',
            message: 'Which cluster would you like to install to?',
            choices: this.clusterIdChoices,
            when: this.clusterIdWhen,
            default: 0
        }, {
            type: 'list',
            name: 'accountId',
            message: 'What account does the cluster belong to?',
            choices: this.accountIdChoices,
            when: this.newClusterWhen,
            default: 0
        }, {
            type: 'confirm',
            name: 'noAccountName',
            message: 'Skip account name in cluster URL?',
            default: true,
            when: this.newClusterWhen
        }, {
            type: 'input',
            name: 'clusterName',
            message: 'What is the cluster display name?',
            default: process.env.USER,
            when: this.newClusterWhen
        }, {
            type: 'input',
            name: 'clusterNamespace',
            default: process.env.USER,
            message: 'What is the cluster namespace?',
            when: this.newClusterWhen
        }, {
            type: 'list',
            name: 'tag',
            default: 0,
            when: process.env.NODE_ENV === 'development',
            choices: ['dragon', process.env.USER, 'canary', 'latest'],
            message: 'What image tags would you like to use?',
        }, {
            type: 'list',
            name: 'env',
            message: 'Which Hub environment would you like to use?',
            choices: ['development', 'staging', 'production'],
            when: () => process.env.NODE_ENV === 'development'
        }, {
            type: 'list',
            name: 'protocol',
            message: 'What protocol do you wish to use?',
            choices: ['https', 'http'],
            default: 0,
            when: () => process.env.NODE_ENV === 'development'
        }], answers)

        return responses
    }

    async createInquire(args) {
        // Accounts are always needed
        this.accounts = await this.manager.hubClient.getAccounts()

        const answers = await this.inquire(args)

        let cluster
        if (answers.clusterId === inquireNewClusterId) {
            // Account only really matters when it's an org
            // otherwise hub will automatically assign it to the current user
            const account = this.findAccount(answers.accountId)

            cluster = await this.manager.hubClient.createCluster({
                namespace: answers.clusterNamespace,
                name: answers.clusterName,
                noAccountName: answers.noAccountName,
                ...(account && account.type === 'o' ? { orgId: answers.accountId } : undefined),
                iaas: {
                    provider: 'kubeconfig'
                }
            })
            this.newClusterId = cluster._id
            await this.manager.hubClient.patchCluster(this.newClusterId, { $set: { 'system.status': 'installing' } })
        }
        else
            cluster = this.findCluster(answers.clusterId)

        if (!answers.clusterKey) {
            // We have to fetch a clusterKey
            const credentials = await this.manager.hubClient.getClusterCredentials(cluster._id, true)
            answers.clusterKey = credentials?.key
        }

        this.spec.protocol = answers.protocol
        this.spec.clusterKey = answers.clusterKey
        this.spec.clusterId = cluster._id
        this.spec.accountName = cluster.accountName
        // TODO: Remove this as it's not used
        // this.spec.clusterName = cluster.name
        this.spec.clusterNamespace = cluster.namespace
        this.spec.tag = answers.tag

        if (answers.env === 'development')
            this.spec.hubServerURL = process.env.HUB_SERVER_URL || `https://c6o-${process.env.USER}.serveo.net`
        else if (answers.env === 'staging')
            this.spec.hubServerURL = 'https://staging.codezero.io'
        else
            this.spec.hubServerURL = 'https://codezero.io'
    }
}