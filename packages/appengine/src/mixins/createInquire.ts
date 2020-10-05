import { baseProvisionerType } from '../index'
import { ParserFactory as parserFactory } from '../parsing/parser'

export const createInquireMixin = (base: baseProvisionerType) => class extends base {

    verbose = false


    async createInquire(args) {

        this.verbose = ( (this.spec.verbose && this.spec.verbose!='') || (args.verbose && args.verbose!=''))
        if(this.verbose) console.log('Verbose is on\n')

        const answers = {
            image: args['image'] || this.spec.image,
            name: args['name'] || this.spec.name,
        }

        const automated = args['automated'] || this.spec.automated

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
            }
        ], answers)

        this.spec.image = responses.image
        this.spec.name = responses.name
        this.spec.edition = this.edition

        this.spec.ports = await this.askPorts(args, automated)
        this.spec.secrets = await this.askSecrets(args, automated)
        this.spec.configs = await this.askConfig(args, automated)
        this.spec.volumes = await this.askVolumes(args, automated)

        this.spec.out = args['out']

        throw new Error('barf')

    }


    async askConfig(args, automated) {

        const secretsParserType = this.spec.secretParser || 'BasicSettingParser'
        const configs = parserFactory.getSettingsParser(secretsParserType).parse(args || this.spec, 'config', this.verbose)
        if (configs && configs.length > 0 || automated) return configs

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
                configs.push({ name: configResponses.configName, value: configResponses.configValue, env: configResponses.envName })
            }
        } while (responses.hasConfig)

        return configs

    }

    async askSecrets(args, automated) {

        const secretsParserType = this.spec.secretParser || 'BasicSettingParser'
        const secrets = parserFactory.getSettingsParser(secretsParserType).parse(args || this.spec, 'secret', this.verbose)
        if (secrets && secrets.length > 0 || automated) return secrets

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
                secrets.push({ name: secretResponses.secretName, value: secretResponses.secretValue, env: secretResponses.envName })
            }
        } while (responses.hasSecret)

        return secrets

    }

    async askPorts(args, automated) {

        const portParserType = this.spec.portParser || 'BasicPortParser'
        const ports = parserFactory.getPortParser(portParserType).parse(args || this.spec, this.verbose)
        if (ports && ports.length > 0 || automated) return ports

        let responses = { hasPorts: false }

        do {
            responses = await this.manager.inquirer?.prompt([
                {
                    type: 'confirm',
                    name: 'hasPorts',
                    message: 'Would you like to add an exposed port?',
                    default: false,
                }
            ])

            if (responses.hasPorts) {

                const configResponses = await this.manager.inquirer?.prompt([
                    {
                        type: 'input',
                        name: 'number',
                        default: 8080,
                        message: 'What is the internal port number on the container?',
                    },
                    {
                        type: 'input',
                        name: 'name',
                        default: 'http',
                        message: 'What is port name?',
                    },
                    {
                        type: 'input',
                        name: 'targetPort',
                        default: 'http',
                        message: 'What is targetPort?',
                    }
                ])
                ports.push({ number: configResponses.number, name: configResponses.name, targetPort: configResponses.targetPort })
            }
        } while (responses.hasPorts)

        return ports

    }

    async askVolumes(args, automated) {

        const storageChoices = ['1Gi', '2Gi', '5Gi', '10Gi', '20Gi', '50Gi', '100Gi']


        const volumeParserType = this.spec.volumeParser || 'BasicVolumeParser'
        const volumes = parserFactory.getVolumeParser(volumeParserType).parse(args || this.spec, this.verbose)
        if (volumes && volumes.length > 0 || automated) return volumes

        let responses = { hasVolumes: false }

        do {
            responses = await this.manager.inquirer?.prompt([
                {
                    type: 'confirm',
                    name: 'hasVolumes',
                    message: 'Would you like to add a persistent volume?',
                    default: false,
                }
            ])

            if (responses.hasVolumes) {

                const configResponses = await this.manager.inquirer?.prompt([
                    {
                        type: 'list',
                        name: 'storageSize',
                        message: 'What size data volume would you like to provision?',
                        choices: storageChoices,
                        default: '5Gi'
                    },
                    {
                        type: 'input',
                        name: 'mountPath',
                        default: '/var',
                        message: 'What path do you want this volume mounted at?',
                    }
                ])

                const volume = { size: configResponses.storageSize, mountPath: configResponses.mountPath, name: 'data' }
                volume.name = `data-${Math.random().toString(36).substring(7)}`
                volumes.push(volume)
            }
        } while (responses.hasVolumes)

        return volumes

    }

}
