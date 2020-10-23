import { baseProvisionerType } from '../index'
import createDebug from 'debug'
const debug = createDebug('@appengine:createInquire')

export const createInquireMixin = (base: baseProvisionerType) => class extends base {

    async createInquire(args) {

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
                validate: r => r !== '' //non empty string
            },
            {
                type: 'input',
                name: 'name',
                message: 'What would you like to name this deployment?',
                default: 'echoserver',
                validate: r => r !== '' //non empty string
            }
        ], answers)

        this.spec.image = responses.image
        this.spec.name = responses.name
        this.spec.edition = this.edition

        this.parseInputsToSpec(args)

        this.spec.configs = await this.askConfig(args, automated)
        this.spec.secrets = await this.askSecrets(args, automated)
        this.spec.ports = await this.askPorts(args, automated)
        this.spec.volumes = await this.askVolumes(args, automated)

        debug('Inquire Completed\n', 'spec:\n', this.spec, 'args:\n', args)

        //czctl install appengine --local -n testing --image redis --name redis --port "6379/TCP/TCP"  --automated
        //czctl install redis --local -n testing

        //czctl install redis --local -n testing  --specOnly > foo.yaml
        //czctl provision foo.yaml

        //appEngine -> provisions docker containers
        //appStudio -> UI to manage appEngine based configuration  (czctl and webui -> icon in marina)
        //appSuite  -> provisioner for provisioners

    }


    async askConfig(args, automated) {

        const configs = this.spec.configs
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
                    when: r => r.hasConfig,
                    validate: r => r !== '' //non empty string
                },
                {
                    type: 'input',
                    name: 'configValue',
                    message: 'What is configuration parameter value?',
                    when: r => r.hasConfig,
                    validate: r => r !== '' //non empty string
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

        const secrets = this.spec.configs
        if (secrets && secrets.length > 0 || automated) return secrets

        let responses = { hasSecret: false, secretName: '', secretValue: '', envName: '' }

        do {
            responses = await this.manager.inquirer?.prompt([
                {
                    type: 'confirm',
                    name: 'hasSecret',
                    message: 'Would you like to add a secret?',
                    default: false
                },
                {
                    type: 'input',
                    name: 'secretName',
                    message: 'What is secret name?',
                    when: r => r.hasSecret,
                    validate: r => r !== '' //non empty string
                },
                {
                    type: 'input',
                    name: 'secretValue',
                    message: 'What is secret value?',
                    when: r => r.hasSecret,
                    validate: r => r !== '' //non empty string
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

        const ports = this.spec.ports
        if (ports && ports.length > 0 || automated) return ports

        let responses = { hasPorts: false, name: '', protocol: 'TCP', port: 8080, targetPort: 0, externalPort: 8080 }

        do {

            //https://kubernetes.io/docs/concepts/services-networking/service/#multi-port-services

            responses = await this.manager.inquirer?.prompt([
                {
                    type: 'confirm',
                    name: 'hasPorts',
                    message: 'Would you like to expose a port?',
                    default: false,
                },
                {
                    type: 'input',
                    name: 'name',
                    default: 'http',
                    message: 'What is the port name?',
                    when: r => r.hasPorts,
                    validate: r => r !== '' //non empty string
                },
                {
                    type: 'list',
                    name: 'protocol',
                    default: 'TCP',
                    choices: ['SCTP', 'TCP', 'UDP'],
                    message: 'What protocol shall this port use?',
                    when: r => r.hasPorts,
                },
                {
                    type: 'input',
                    name: 'port',
                    default: 8080,
                    message: 'What is the internal port on the container (port)?',
                    when: r => r.hasPorts,
                    validate: r => this.isNumeric(r)  //validate that it is a Number()
                },
                {
                    type: 'input',
                    name: 'targetPort',
                    default: responses.port,
                    //# By default and for convenience, the `targetPort` is set to the same value as the `port` field
                    message: 'Which port would you like to use within the cluster (optional)?',
                    when: r => r.hasPorts,
                    validate: r => this.isNumeric(r)  //validate that it is a Number()
                }
            ])

            if (responses.hasPorts)
                ports.push({ name: responses.name, protocol: responses.protocol, port: Number(responses.port), targetPort: Number(responses.targetPort) })

        } while (responses.hasPorts)

        return ports


    }
    isNumeric(n) {
        return !isNaN(parseFloat(n)) && isFinite(n)
    }

    async askVolumes(args, automated) {

        const volumes = this.spec.volumes
        if (volumes && volumes.length > 0 || automated) return volumes

        const storageChoices = ['1Gi', '2Gi', '5Gi', '10Gi', '20Gi', '50Gi', '100Gi']
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
                    default: '5Gi',
                    when: r => r.hasVolumes

                },
                {
                    type: 'input',
                    name: 'mountPath',
                    default: '/var',
                    message: 'What path do you want this volume mounted at?',
                    when: r => r.hasVolumes,
                    validate: r => r !== '' //non empty string
                },
                {
                    type: 'input',
                    name: 'volumeName',
                    default: 'data-var',
                    message: 'What would you like to name this volume?',
                    when: r => r.hasVolumes,
                    validate: r => r !== '' //non empty string
                }
            ])

            if (responses.hasVolumes) {
                volumes.push({ size: responses.storageSize, mountPath: responses.mountPath, name: responses.volumeName })
            }
        } while (responses.hasVolumes)

        return volumes

    }
}
