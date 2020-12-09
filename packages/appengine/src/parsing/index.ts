import * as portParsers from './port'
import * as settingsParsers from './setting'
import * as volumeParsers from './volume'
import createDebug from 'debug'

const debug = createDebug('@appengine:Parser')

export class ParserFactory{
    static getPortParser(type: string) : PortParser {
        return new portParsers[type]()
    }
    static getSettingsParser(type: string) : SettingsParser {
        return new settingsParsers[type]()
    }
    static getVolumeParser(type: string) : VolumeParser {
        return new volumeParsers[type]()
    }
}


export interface PortParser {
    parse(args: any, spec: any): Port[];
}
export interface SettingsParser {
    parse(args: any, spec: any, type: string): Setting[];
}
export interface VolumeParser {
    parse(args: any, spec: any): Volume[];
}

//https://kubernetes.io/docs/concepts/overview/working-with-objects/common-labels/
export interface LabelsMetadata {
    name?: string
    appId?: string
    instanceId?: string
    partOf?: string
    component?: string
    version?: string
    edition?: string
}


export interface Setting {
    name: string
    value: string
    env: string
    type: string
    label: string
    hint: string
    required: boolean
    autoselect: boolean
    fieldType: string
}

export type probeType = 'liveness' | 'startup' | 'readiness'

//https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/
export interface Probe {
    type: probeType

    path: string     //Path to access on the HTTP server.
    port: string    //Name or number of the port to access on the container. Number must be in the range 1 to 65535
    httpType: string
    httpHeaders: string  //Custom headers to set in the request. HTTP allows repeated headers.
    host: string  //Host name to connect to, defaults to the pod IP. You probably want to set "Host" in httpHeaders instead.
    scheme: string   //Scheme to use for connecting to the host (HTTP or HTTPS). Defaults to HTTP.

    //failureThreshold: When a probe fails, Kubernetes will try failureThreshold times before giving up. Giving up in case of liveness probe means restarting the container. In case of readiness probe the Pod will be marked Unready. Defaults to 3. Minimum value is 1.
    failureThreshold: number

    //initialDelaySeconds: Number of seconds after the container has started before liveness or readiness probes are initiated. Defaults to 0 seconds. Minimum value is 0.
    initialDelaySeconds: number

    //periodSeconds: How often (in seconds) to perform the probe. Default to 10 seconds. Minimum value is 1.
    periodSeconds: number

    //timeoutSeconds: Number of seconds after which the probe times out. Defaults to 1 second. Minimum value is 1.
    timeoutSeconds: number

    //successThreshold: Minimum consecutive successes for the probe to be considered successful after having failed. Defaults to 1. Must be 1 for liveness. Minimum value is 1.
    successThreshold: number

    // command: unknown     NOT IMPLEMENTED FOR NOW
    // tcpSocket: unknown   NOT IMPLEMENTED FOR NOW
}

export interface Port {
    name: string
    protocol: string
    port: number
    targetPort: number
    probe?: Probe[]
}

export interface Volume {
    size: string
    mountPath?: string
    subPath?: string
    name: string
}