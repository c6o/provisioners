import { baseProvisionerType } from '../index'
import { FlowProcessor, skippedSteps as testSteps } from '../flow'
import createDebug from 'debug'
import { keyValue } from '@provisioner/contracts'

const debug = createDebug('@appengine:createInquire')

export const createInquireMixin = (base: baseProvisionerType) => class extends base {

    async createInquire(args) {
        if (!this.manifestHelper.image)
            await this.inquireApplicationImage(args)

        // Steps will come from the applicationSpec but for now, we use test data
        if (this.manifestHelper.flow) {
            // Let the flowProcessor run inquire
            const flowProcessor = new FlowProcessor(this.manager.inquirer, this.manager.document)
            const result = await flowProcessor.process(this.manifestHelper.flow)
            this.manifestHelper.processResult(result)
        }

        this.manifestHelper.postInquire()
    }

    async inquireApplicationImage(args) {
        const answers = {
            tag: this.manifestHelper.tag || 'latest',
            image: this.manifestHelper.image
        }

        const responses = await this.manager.inquirer?.prompt([
            {
                type: 'input',
                name: 'image',
                message: 'Which docker image would you like to use?',
                validate: r => r !== '' //non empty string
            },
            {
                type: 'input',
                name: 'tag',
                message: 'Which image tag would you like to use?',
                validate: r => r !== '' //non empty string
            }
        ], answers)

        this.manifestHelper.provisioner.tag = responses.tag
        this.manifestHelper.provisioner.image = responses.image

        await this.askSettings('configs', args)
        await this.askSettings('secrets', args)
        // TODO: Volumes and Ports

    }

    async askSettings(type: 'configs' | 'secrets', args) {
        const configs: keyValue = {}
        const typeDisplay = type === 'configs' ? 'configuration' : 'secret'
        do {
            const responses = await this.manager.inquirer?.prompt([
                {
                    type: 'confirm',
                    name: 'hasVal',
                    message: `Would you like to add a ${typeDisplay} parameter?`,
                    default: false,
                },
                {
                    type: 'input',
                    name: 'key',
                    message: `What is ${typeDisplay} parameter name?`,
                    when: r => r.hasConfig,
                    validate: r => r !== '' //non empty string
                },
                {
                    type: 'input',
                    name: 'value',
                    message: `What is ${typeDisplay} parameter value?`,
                    when: r => r.hasConfig,
                    validate: r => r !== '' //non empty string
                }
            ])

            if (responses.hasVal)
                configs[responses.key] = responses.value
            else
                break

        } while (true)

        this.manifestHelper.processResult({
            [type]: {
                ...configs
            }
        })
    }

    async askPorts(args, automated, ports) {

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

    async askVolumes(args, automated, volumes) {

        if (volumes && volumes.length > 0 || automated) return volumes

        const storageChoices = ['1Gi', '2Gi', '5Gi', '10Gi', '20Gi', '50Gi', '100Gi']
        let responses = { hasVolumes: false, storageSize: '', mountPath: '', volumeName: '', subPath: '' }

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
                    name: 'subPath',
                    default: '',
                    message: 'What sub path do you want this volume mounted at?',
                    when: r => r.hasVolumes,
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
                volumes.push({ size: responses.storageSize, mountPath: responses.mountPath, name: responses.volumeName, subPath: responses.subPath })
            }
        } while (responses.hasVolumes)

        return volumes

    }

}
