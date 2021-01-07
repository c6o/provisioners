import createDebug from 'debug'
import { ProvisionerManager } from '@provisioner/common'
import { AppObject } from '@provisioner/contracts'
import { AppEngineAppDocument, FlowResult, isPortNumber, keyValue, ServicePort, DeploymentPort, LabelsMetadata } from './contracts'
import * as fs from 'fs'
//import { AppObject } from "@provisioner/contracts"
const debug = createDebug('@appengine:timing')

export class TimingReporter implements TimingReporter {
    report(state: AppEngineState) {
        debug(`APPX - TimingReporter - ${JSON.stringify(state).split('\n').join('')}`)
        return true
    }
}

export interface TimingReporter {
    report(state: AppEngineState)
}

export class AppEngineState {
    timing: AppProvisionerTimer[]
    labels: LabelsMetadata
    args: any
    parsed: boolean
    platform: string
    timestamp: Date
    publicDNS: string
    publicURI: string

    timerChangedAction

    onTimerChanged(action) {
        this.timerChangedAction = action
    }

    startTimer(name: string) {
        let existing = this.timing.find(e => e.name === name)
        if (existing === undefined) {
            existing = new AppProvisionerTimer()
            existing.name = name
            this.timing.push(existing)
        }
        existing.start = (new Date()).getTime()
        if (this.timerChangedAction) this.timerChangedAction({ action: 'startTimer', name, state: this })
        return existing
    }

    endTimer(name?: string) {
        let existing = this.timing.find(e => e.name === name)
        if (existing === undefined) {
            existing = new AppProvisionerTimer()
            existing.name = name
            existing.start = (new Date()).getTime()
            this.timing.push(existing)
        }
        existing.end = (new Date()).getTime()
        existing.duration = existing.end - existing.start
        if (this.timerChangedAction) this.timerChangedAction({ action: 'endTimer', name, state: this })

    }

    constructor(labels: LabelsMetadata, args?: any) {
        this.timing = new Array<AppProvisionerTimer>()
        this.labels = labels
        this.parsed = false
        this.timestamp = new Date()
        this.platform = 'Web'

        if (this.labels.instanceId === undefined) {
            const helper = new Helper()
            this.labels.instanceId = helper.makeRandom(5)
        }

        this.args = args || {}
    }
}
export class AppProvisionerTimer {
    name: string
    start: number
    end: number
    duration: number
}

export interface AppManifest {
    readonly document: any
    readonly edition: string
    readonly description: string
    readonly displayName: string
    readonly iconUrl: string
    readonly appId: string
    readonly namespace: string
    readonly provisioner: any
    readonly name: string
    readonly spec: string
}


export class AppEngineAppObject extends AppObject {
    document: AppEngineAppDocument

    get flow() { return this.document.spec.provisioner?.flow  }

    get configs() { return this.document.spec.provisioner?.configs }
    get hasConfigs() { return this.document.spec.provisioner?.configs && Object.keys(this.document.spec.provisioner.configs).length }

    get secrets() { return this.document.spec.provisioner?.secrets  }
    get hasSecrets() { return this.document.spec.provisioner?.secrets && Object.keys(this.document.spec.provisioner.secrets).length }
    get base64Secrets() {
        const secrets: keyValue = { }
        for(const key in this.document.spec.provisioner?.secrets) {
            secrets[key] = Buffer.from(secrets[key]).toString('base64')
        }
        return secrets
    }


    get volumes()  { return this.document.spec.provisioner?.volumes  }
    get ports() { return this.document.spec.provisioner?.ports  }
    get hasPorts() { return !!this.ports }

    get imagePullPolicy() { return this.document.spec.provisioner?.imagePullPolicy  }
    get command() { return this.document.spec.provisioner?.command  }

    get image() { return this.document.spec.provisioner?.image  }

    constructor(document: AppEngineAppDocument) {
        super(document)
    }

    postInquire() {
        this.document.spec.provisioner['flow'] = '$unset'
    }

    processResult(result: FlowResult) {
        const provisioner = this.document.spec.provisioner
        // Merge the results
        provisioner.configs = Object.assign(provisioner.configs || {}, result.configs)
        provisioner.secrets = Object.assign(provisioner.secrets || {}, result.secrets)
    }

    getComponentLabels(): keyValue {
        const packageJSON = JSON.parse(fs.readFileSync('../package.json').toString('utf8'))
        return {
            app: this.name,
            name: this.name,
            'system.codezero.io/appengine': packageJSON .version,
            'system.codezero.io/app': this.name, // This is used to render GetInfo in Marina
            'system.codezero.io/id': this.instanceId,
            'app.kubernetes.io/name': this.name,
            'app.kubernetes.io/managed-by': 'codezero',
            'system.codezero.io/edition': this.edition
        }
    }

    getServicePorts(): ServicePort[] {
        if (!this.ports)
            return

        if (isPortNumber(this.ports))
            return [{
                port: this.ports,
                protocol: 'TCP'
            }]

        return this.ports.map(port => {
            port.protocol = port.protocol.toUpperCase()
            return port
        })
    }

    getDeploymentPorts = (): DeploymentPort[] => this.getServicePorts().map(portItem => {
        const { port, ...rest } = portItem
        return {
            containerPort: port,
            ...rest
        }
    })

}

export class Helper {

    get systemServerConfigMap() {
        return {
            kind: 'ConfigMap',
            metadata: {
                namespace: 'c6o-system',
                name: 'system-server-config' // constants?
            }
        }
    }
    async getApplicationURI(manager: ProvisionerManager, appName: string, namespace: string) {
        return `https://${await this.getApplicationDNS(manager, appName, namespace)}`
    }

    host: string = void 0

    async getApplicationDNS(manager: ProvisionerManager, appName: string, namespace: string) {

        if(this.host !== void 0) return this.host

        const result = await manager.cluster.read(this.systemServerConfigMap)
        if (result.error) {
            // TODO: log failure
            return void 0
        }

        const _host = result.object?.data?.HOST

        if (!_host) {
            // TODO: log missing host
            return void 0
        }

        this.host = `${appName}-${namespace}.${_host}`
        return this.host
    }

    makeRandom(len) {
        let text = ''
        const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

        for (let i = 0; i < len; i++)
            text += possible.charAt(Math.floor(Math.random() * possible.length))

        return text
    }

    emitFile = true
    PrettyPrintJsonFile(json: any, file = 'debug.json') {
        if (!this.emitFile) return
        if (!file) file = 'debug.json'
        file = `${__dirname}/${file}`
        if (!file.endsWith('.json')) file = `${file}.json`
        debug(file, json)
        return file
    }
}