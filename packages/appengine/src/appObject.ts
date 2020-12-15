import { LabelsMetadata } from "./parsing"
import createDebug from 'debug'
const debug = createDebug('@appengine:timing')

export class TimingReporter implements TimingReporter {
    report(state: AppEngineState) {
        debug('TimingReporter:', state)
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
    readonly routes: string
    readonly name: string
    readonly spec: string
    hasCustomConfigFields(): boolean
    hasCustomSecretFields(): boolean
    hasVolumes(): boolean
    customConfigFields()
    customSecretFields()
}


export class AppObject implements AppManifest {

    constructor(public document) { }

    private fieldTypes = ['text', 'password', 'checkbox', 'timezone', 'combobox']

    hasVolumes(): boolean {
        return this.provisioner.volumes.length > 0
    }
    hasCustomConfigFields(): boolean {
        return this.customConfigFields().length > 0
    }
    hasCustomSecretFields(): boolean {
        return this.customSecretFields().length > 0
    }
    customConfigFields() {
        return this.provisioner.configs.filter(e => this.fieldTypes.includes(e.fieldType?.toLowerCase()))
    }
    customSecretFields() {
        return this.provisioner.secrets.filter(e => this.fieldTypes.includes(e.fieldType?.toLowerCase()))
    }

    //Required for appEngine provisioner
    get edition() {
        return this.document.metadata.namespace
    }
    get description() {
        return this.document.metadata.annotations?.['system.codezero.io/description'] || this.appId
    }
    get displayName() {
        return this.document.metadata.annotations?.['system.codezero.io/display'] || this.appId
    }
    get iconUrl() {
        return this.document.metadata.annotations?.['system.codezero.io/iconUrl']
    }

    //Provisioner appId itself and NOT the database identifier
    get appId() {
        return this.document.metadata.name
    }

    get namespace() {
        return this.document.metadata.namespace
    }

    get spec() {
        return this.document.spec
    }

    get provisioner() {
        return this.document.spec.provisioner
    }

    get routes() {
        return this.document.spec.routes
    }

    get name() {
        return this.document.metadata.name
    }

}

export class Helper {

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