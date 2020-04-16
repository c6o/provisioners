import { baseProvisionerType } from '../'

export const preprovisionMixin = (base: baseProvisionerType) => class extends base {

    newClusterId = '** new cluster **'

    clusters
    accounts

    findCluster = (id) => this.clusters.find(cluster => cluster._id === id)
    findAccount = (id) => this.accounts.find(account => account._id === id)

    clusterIdWhen = async (answers) => {
        this.clusters = await this.options.hubClient.getClusters()
        this.accounts = await this.options.hubClient.getAccounts()
        if (this.clusters.length === 0) {
            // There are no clusters to choose. Force the user to create a new one
            answers.clusterId = this.newClusterId
            return false
        }
        return true
    }

    clusterIdChoices = async () => {
        const choices = this.clusters.map(cluster => ({ name: cluster.name, value: cluster._id }))
        const newCluster = { name: 'New cluster', value: this.newClusterId }
        choices.unshift(newCluster, new this.manager.inquirer.Separator())
        return choices
    }

    newClusterWhen = async (answers) => {
        return answers.clusterId === this.newClusterId
    }
    accountIdChoices = _ => this.accounts.map(account => ({ name: account.name, value: account._id }))

    async inquire() {
        const answers = {
            env: this.options['staging'],
            clusterId: this.options['id'],
            clusterDomain: this.options['domain'],
            accountName: this.options['account'],
            clusterName: this.options['name'],
            clusterNamespace: this.options['namespace'],
            hubToken: this.options['token'] || this.options.hubClient?.token
        }

        if (!this.options.hubClient || !this.manager.inquirer)
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
            name: 'env',
            message: 'Which Hub environment would you like to use?',
            choices: ['staging', 'production'],
            when: () => process.env.NODE_ENV === 'development'
        }], answers)

        return responses
    }

    async preprovision() {
        const answers = await this.inquire()

        let cluster
        if (answers.clusterId === this.newClusterId) {
            cluster = await this.options.hubClient.createCluster({
                namespace: answers.clusterNamespace,
                name: answers.clusterName
            })
        }
        else
            cluster = this.findCluster(answers.clusterId)

        const account = this.findAccount(answers.accountId || cluster.accountId)

        this.spec.hubToken = this.options.hubClient.token
        this.spec.clusterId = cluster._id
        this.spec.accountName = account.namespace
        this.spec.clusterName = cluster.name
        this.spec.clusterNamespace = cluster.namespace

        if (answers.env == 'staging') {
            this.spec.hubServer = 'https://staging.hub.traxitt.com'
            this.spec.clusterDomain = 'stg.traxitt.org'
        }
        else {
            this.spec.hubServer = 'https://hub.traxitt.com'
            this.spec.clusterDomain = 'traxitt.org'
        }
    }
}