import { baseProvisionerType } from '../index'

export const createTaskInquireMixin = (base: baseProvisionerType) => class extends base {

    grafanaStatus
    prometheusStatus
    taskChoices = async () => {
        const choices = []
        if (this.grafanaStatus.choices)
            choices.push({name: 'Link Grafana', value: 'link-grafana'})
        else
            choices.push({name: 'Unlink Grafana', value: 'unlink-grafana'})

        if (this.prometheusStatus.choices)
            choices.push({name: 'Link Prometheus', value: 'link-prometheus'})
        else
            choices.push({name: 'Unlink Prometheus', value: 'unlink-prometheus'})
        return choices
    }

    taskToApp = (taskName) => taskName === 'link-grafana' ||  taskName === 'unlink-grafana' ? 'Grafana' : 'Prometheus'
    taskToStatus = (taskName) => taskName === 'link-grafana' || taskName === 'unlink-grafana' ? this.grafanaStatus : this.prometheusStatus
    messageLinkNamespace = (answers) => `Which ${this.taskToApp(answers.taskName)} would you like to link to?`
    choicesLinkNamespace = (answers) => this.taskToStatus(answers.taskName).choices

    whenLinkNamespace = (answers) => {
        const status = this.taskToStatus(answers.taskName)

        if (!status.choices)
            return false

        if (status.choices.length == 0)
            throw Error(`Please install ${this.taskToApp(answers.taskName)} before trying to link to it.`)
        if (status.choices.length == 1) {
            answers.linkNamespace = status.choices[0]
            return false
        }
        return true
    }


    async askInquire() {
        const answers = {
            taskName: this.taskSpec.metadata?.labels?.ask,
            linkNamespace: this.taskSpec.spec?.namespace
        }

        return await this.manager.inquirer.prompt([{
            type: 'list',
            name: 'taskName',
            message: 'Which task would you like to perform?',
            choices: this.taskChoices,
            default: 0
        }, {
            type: 'list',
            name: 'linkNamespace',
            message: this.messageLinkNamespace,
            when: this.whenLinkNamespace,
            choices: this.choicesLinkNamespace,
            default: 0
        }, ], answers)
    }

    async createTaskInquire(answers) {
        this.grafanaStatus = await this['grafana-link'].find()
        this.prometheusStatus = await this['prometheus-link'].find()

        const responses = await this.askInquire()

        if (!this.taskSpec.metadata.labels.ask) {
            if (!responses.taskName)
                throw Error('Unable to determine what is being asked')

            this.taskSpec.metadata.labels.ask = responses.taskName
        }

        if (this.taskSpec.metadata.labels.ask.startsWith('link') && !this.taskSpec.metadata.spec?.namespace) {
            if (!responses.linkNamespace)
                throw Error('Namespace is required to link')
            if (this.taskSpec.spec)
                this.taskSpec.spec.namespace = responses.linkNamespace
            else
                this.taskSpec.spec = {namespace: responses.linkNamespace}
        }

        if (this.taskSpec.metadata.labels.ask.startsWith('unlink')) {
            const taskName = this.taskSpec.metadata.labels.ask
            const appName = this.taskToApp(taskName)
            const status = this.taskToStatus(taskName)
            if (!status.namespace)
                throw Error(`The app ${appName} is not linked. Please link it first.`)

            if (this.taskSpec.spec)
                this.taskSpec.spec.namespace = status.namespace
            else
                this.taskSpec.spec = {namespace: status.namespace}
        }
    }
}