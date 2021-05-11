import { Resource, keyValue } from '@c6o/kubeclient-contracts'
import { AppDocumentLabels, AppDocumentSpec } from '@provisioner/contracts'
import { GenerateOptions } from 'generate-password'
import { Flow } from './flow'

export interface ServicePort {
    name?: string
    protocol: string
    port: number
    [key: string]: any
}

export interface DeploymentPort {
    name?: string
    protocol: string
    containerPort: number
    [key: string]: any
}

export interface Volume {
    name: string
    size: string
    mountPath: string
    subPath?: string
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

type generateObject = { generate: GenerateOptions }
type generatorValue =  string | generateObject
export type keyValueOrGenerator = keyValue | {[key:string] : generatorValue }

export const isGenerateOptions = (value: generatorValue): value is generateObject =>
    !!(value as generateObject).generate

export type portType = number | ServicePort[]
export const isPortNumber =(value: portType): value is number => typeof value === 'number'

export interface AppEngineAppSpecProvisioner extends AppDocumentSpec {
    image?: string
    flow?: Flow

    configs?: keyValueOrGenerator
    secrets?: keyValueOrGenerator

    configMapRefs?: string[]
    secretRefs?: string[]

    volumes?: Volume[]
    ports?: portType

    // Container image parameters
    imagePullPolicy?: string
    command?: string[]
}


export interface AppEngineAppSpec extends AppDocumentSpec {
    provisioner?: AppEngineAppSpecProvisioner
}

export interface AppEngineAppResource extends Resource {
    labels?: AppDocumentLabels
    spec?: AppEngineAppSpec
}
