import { baseProvisionerType } from '../index'

export const createInquireMixin = (base: baseProvisionerType) => class extends base {


    parseConfigSecrets(args, name)  {

        const results = []
        const rawValues = args[name] || this.spec[name]

        if(rawValues) {
            if(typeof rawValues == 'string') {
                results.push(this.parseSingle(rawValues))
            } else {
                for(const single of rawValues) {
                    results.push(this.parseSingle(single))
                }
            }
        }
        return results
    }

    parseSingle(single: string) {
        const pos = single.indexOf(':')
        let value = { name:'', value:'', env:'' }

        if(pos > 0) {
            value.name = single.substr(0, pos)
            const right = single.substr(pos+1)
            const comma = right.indexOf(',')
            if(comma > 0) {
                value.value = right.substr(0, comma)
                value.env = right.substr(comma+1)
            } else {
                value.value = right
            }
        }
        return value
    }

    async askConfig(args) {


        const configs = this.parseConfigSecrets(args, 'config')

        if(configs && configs.length>0) return

        let responses = { hasConfig: false }

        do {
            responses = await this.manager.inquirer?.prompt([
                {
                    type: 'confirm',
                    name: 'hasConfig',
                    message: 'Would you like to add a configuration parameter?',
                    default: false,
                }
            ])

            if (responses.hasConfig) {

                const configResponses = await this.manager.inquirer?.prompt([
                    {
                        type: 'input',
                        name: 'configName',
                        message: 'What is configuration parameter name?',
                    },
                    {
                        type: 'input',
                        name: 'configValue',
                        message: 'What is configuration parameter value?',
                    },
                    {
                        type: 'input',
                        name: 'envName',
                        message: 'Docker environment variable name (optional)?',
                    }
                ])
                configs.push( { name: configResponses.configName, value: configResponses.configValue, env: configResponses.envName})
            }
        } while (responses.hasConfig)

        return configs

    }

    async askSecrets(args) {

        const secrets = this.parseConfigSecrets(args, 'secret')

        if(secrets && secrets.length>0) return

        let responses = { hasSecret: false }

        do {
            responses = await this.manager.inquirer?.prompt([
                {
                    type: 'confirm',
                    name: 'hasSecret',
                    message: 'Would you like to add a secret?',
                    default: false,
                }
            ])

            if (responses.hasSecret) {

                const secretResponses = await this.manager.inquirer?.prompt([
                    {
                        type: 'input',
                        name: 'secretName',
                        message: 'What is secret name?',
                    },
                    {
                        type: 'input',
                        name: 'secretValue',
                        message: 'What is secret value?',
                    },
                    {
                        type: 'input',
                        name: 'envName',
                        message: 'Docker environment variable name (optional)?',
                    }

                ])
                secrets.push( { name: secretResponses.secretName, value: secretResponses.secretValue, env: secretResponses.envName })
            }
        } while (responses.hasSecret)

        return secrets

    }

    async createInquire(args) {


        const answers = {
            image: args['image'] || this.spec.image,
            name: args['name'] || this.spec.name,
            containerPort: args['container-port'] || this.spec.containerPort
        }

        const responses = await this.manager.inquirer?.prompt([
            {
                type: 'input',
                name: 'image',
                message: 'Which docker image would you like to use?',
                default: 'xperimental/goecho:v1.7',
                validate: (image) => (image !== '' ? true : '')
            },
            {
                type: 'input',
                name: 'name',
                message: 'What would you like to name this deployment?',
                default: 'echoserver',
                validate: (name) => (name !== '' ? true : '')
            },
            {
                type: 'input',
                name: 'containerPort',
                message: 'Which port does the container use?',
                default: 8080,
                validate: (containerPort) => {
                    if (containerPort === '') return false
                    return Number(containerPort) > 0
                }
            }

        ], answers)

        this.spec.image = responses.image
        this.spec.name = responses.name
        this.spec.containerPort = Number(responses.containerPort)
        this.spec.edition = this.edition

        this.spec.secrets = await this.askSecrets(args)
        this.spec.configs = await this.askConfig(args)

    }
}
