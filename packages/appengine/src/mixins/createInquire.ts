import { baseProvisionerType } from '../index'
import createDebug from 'debug'
import { ParserFactory as parserFactory } from '../parsing'


const debug = createDebug('@appengine:createInquire')

export const createInquireMixin = (base: baseProvisionerType) => class extends base {

    async createInquire(args) {

        this.spec.dryRun = false
        if(args['dry-run']) {
            args.applier = 'DryRunApplier'
        }
        if(args.applier) this.spec.applier = args.applier
        if(this.spec.applier === 'DryRunApplier') this.spec.dryRun = true

        const answers = {
            image: args['image'] || this.spec.image,
            name: args['name'] || this.spec.name,
        }
        const automated = args['automated'] || this.spec.automated

        debug('Inquire started\n', 'spec:\n', this.spec, 'args:\n', args)

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

        this.spec.configs = await this.askConfig(args, automated)
        this.spec.secrets = await this.askSecrets(args, automated)
        this.spec.ports = await this.askPorts(args, automated)
        this.spec.volumes = await this.askVolumes(args, automated)

        this.spec.out = args['out']

        debug('Inquire Completed\n', 'spec:\n', this.spec, 'args:\n', args)


    }


    async askConfig(args, automated) {

        const secretsParserType = this.spec.secretParser || 'BasicSettingParser'
        const configs = parserFactory.getSettingsParser(secretsParserType).parse(args, this.spec, 'config', debug)
        if (configs.length > 0 || automated) return configs

        let responses = { hasConfig: false, configName : '', configValue : '', envName : '' }

        do {
            responses = await this.manager.inquirer?.prompt([
                {
                    type: 'confirm',
                    name: 'hasConfig',
                    message: 'Would you like to add a configuration parameter?',
                    default: false,
                },
                {
                    type: 'input',
                    name: 'configName',
                    message: 'What is configuration parameter name?',
                    when: r => r.hasConfig
                },
                {
                    type: 'input',
                    name: 'configValue',
                    message: 'What is configuration parameter value?',
                    when: r => r.hasConfig
                },
                {
                    type: 'input',
                    name: 'envName',
                    message: 'Container environment variable name (optional)?',
                    when: r => r.hasConfig
                }
            ])

            if (responses.hasConfig)
                configs.push({ name: responses.configName, value: responses.configValue, env: responses.envName })

        } while (responses.hasConfig)

        return configs

    }

    async askSecrets(args, automated) {

        const secretsParserType = this.spec.secretParser || 'BasicSettingParser'
        const secrets = parserFactory.getSettingsParser(secretsParserType).parse(args, this.spec, 'secret', debug)
        if (secrets && secrets.length > 0 || automated) return secrets

        let responses = { hasSecret: false, secretName: '', secretValue: '', envName: '' }

        do {
            responses = await this.manager.inquirer?.prompt([
                {
                    type: 'confirm',
                    name: 'hasSecret',
                    message: 'Would you like to add a secret?',
                    default: false,
                },
                {
                    type: 'input',
                    name: 'secretName',
                    message: 'What is secret name?',
                    when: r => r.hasSecret
                },
                {
                    type: 'input',
                    name: 'secretValue',
                    message: 'What is secret value?',
                    when: r => r.hasSecret
                },
                {
                    type: 'input',
                    name: 'envName',
                    message: 'Container environment variable name (optional)?',
                    when: r => r.hasSecret

                }
            ])

            if (responses.hasSecret)
                secrets.push({ name: responses.secretName, value: responses.secretValue, env: responses.envName })

        } while (responses.hasSecret)

        return secrets

    }

    async askPorts(args, automated) {

        const portParserType = this.spec.portParser || 'BasicPortParser'
        const ports = parserFactory.getPortParser(portParserType).parse(args, this.spec, debug)
        if (ports && ports.length > 0 || automated) return ports

        let responses = { hasPorts: false, number: 80, name: '', targetPort: '' }

        do {
            responses = await this.manager.inquirer?.prompt([
                {
                    type: 'confirm',
                    name: 'hasPorts',
                    message: 'Would you like to add an exposed port?',
                    default: false,
                },
                {
                    type: 'input',
                    name: 'number',
                    default: 8080,
                    message: 'What is the internal port number on the container?',
                    when: r => r.hasPorts
                },
                {
                    type: 'input',
                    name: 'name',
                    default: 'http',
                    message: 'What is port name?',
                    when: r => r.hasPorts
                },
                {
                    type: 'input',
                    name: 'targetPort',
                    default: '80|http',  //should be a number....  need to research
                    message: 'What is targetPort?',
                    when: r => r.hasPorts
                    //validate: a => a...  //validate that it is a Number()
                //do you want to expose this outside of the cluster?   need to expose via the R#outes/nodes in the manifest
            }
            ])

            if (responses.hasPorts) {
                ports.push({ number: responses.number, name: responses.name, targetPort: responses.targetPort })
            }
        } while (responses.hasPorts)

        return ports


    }

    async askVolumes(args, automated) {

        const storageChoices = ['1Gi', '2Gi', '5Gi', '10Gi', '20Gi', '50Gi', '100Gi']


        const volumeParserType = this.spec.volumeParser || 'BasicVolumeParser'
        const volumes = parserFactory.getVolumeParser(volumeParserType).parse(args, this.spec, debug)
        if (volumes && volumes.length > 0 || automated) return volumes

        let responses = { hasVolumes: false, storageSize: '', mountPath: '', volumeName: '' }

        do {
            responses = await this.manager.inquirer?.prompt([
                {
                    type: 'confirm',
                    name: 'hasVolumes',
                    message: 'Would you like to add a persistent volume?',
                    default: false,
                },
                {
                    type: 'list',
                    name: 'storageSize',
                    message: 'What size data volume would you like to provision?',
                    choices: storageChoices,
                    default: '5Gi'
                },//╰─$ czctl install --local --n testing appengine --name foo --image foo --verbose --applier ObjectApplier --secret foo:bar --config d:fff  --out yaml

                {
                    type: 'input',
                    name: 'mountPath',
                    default: '/var',
                    message: 'What path do you want this volume mounted at?',
                },
                {
                    type: 'input',
                    name: 'volumeName',
                    default: `data-${Math.random().toString(36).substring(7)}`,  //could also use mountPath to name it
                    message: 'What would you like to name this volume?',
                }
            ])

            if (responses.hasVolumes) {
                volumes.push({ size: responses.storageSize, mountPath: responses.mountPath, name: responses.volumeName })
            }
        } while (responses.hasVolumes)

        return volumes

    }

}
