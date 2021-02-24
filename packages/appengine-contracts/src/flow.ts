import { Options as generatorOptions } from 'generate-password'
import { keyValue } from '@c6o/kubeclient-contracts'
export { Options as generatorOptions } from 'generate-password'

export type functionExpression = string | Function // this is an inline function that's turned into an expression
export const isFunctionString = (func: functionExpression): func is string => func && typeof func === 'string'

export interface ChoiceObject {
    key?: string // technically a char but typescript does not have a char
    name: string
    value?: number | string
    disabled?: string
    checked?: boolean
}

export const choiceSeparator = '<<separator>>'
export type choiceSeparatorType = '<<separator>>'

export interface c6oExtensions {
    target?: 'configs' | 'secrets' | 'transient'
    label?: string
    required?: boolean
    generate?: generatorOptions
    generateMessage?: string
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    value: any
    maxlength?: number
    min?: number
    max?: number
    step?: number
    hasControls?: boolean
    errorMessage?: string
    dataSource: string
}

export interface InquirePrompt {
    type: 'input' | 'number' | 'confirm' | 'list' | 'rawlist' | 'expand' | 'checkbox' | 'password' | 'editor'
    name: string
    message?: string
    default?: string | number | boolean | string[]
    askAnswered?: boolean
    mask?: string // technically a char but typescript does not have a char

    // The following  will be mapped to inquirer formats
    choices?: Array<string | number | ChoiceObject | choiceSeparatorType>
    validate?: functionExpression
    when?: functionExpression
}

export interface Prompt extends InquirePrompt {
    // The following is codeZero extensions and they will be removed
    // from the final inquire data structure
    c6o?: c6oExtensions
}

export type PromptType = Prompt | Prompt[]

// A section allows the developer to group
// questions on the web ui or cli and
export interface Section {
    title: string
    prompts: PromptType
}

// A step defines a collection of
// sections (inquirer questions grouped around a title)
// or inquirer questions
export interface Step {
    name?: string
    skip?: functionExpression

    // Has to have one and only one of the below
    sections?: Section[]
    prompts?: PromptType
}

// This is the entry point
// where all the magic starts
export type Steps = Step | Step[]

export type Flow = Steps | '$unset'

export interface FlowResult {
    transient?: keyValue
    configs?: keyValue
    secrets?: keyValue
}

// Makes it easy to use for...of
// against a single object or an array of objects
// and is undefined safe
export function* each<T>(items: T | Array<T>) {
    if (!items)
        return // kills the generator and makes for(const x of each(undefined)) safe to run
    if (!Array.isArray(items))
        yield items
    else
        for(const item of items)
            yield item
}