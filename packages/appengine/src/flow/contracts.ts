import { Options as contracts } from 'generate-password'

export type functionExpression = string | Function // this is an inline function that's turned into an expression
export const isFunctionString = (func: functionExpression): func is string => func && typeof func === 'string'

export interface choiceObject {
    key?: string // technically a char but typescript does not have a char
    name: string
    value?: number | string
    disabled?: string
    checked?: boolean
}

export const choiceSeparator = '<<separator>>'
export type choiceSeparatorType = '<<separator>>'

export interface c6oExtensions {
    target?: 'config' | 'secret' | 'transient'
    required?: boolean
    password?: contracts
}

// This is
export interface inquireStep {
    type: 'input' | 'number' | 'confirm' | 'list' | 'rawlist' | 'expand' | 'checkbox' | 'password' | 'editor'
    name: string
    message?: string
    default?: string | number | boolean | Array<string | number | boolean>
    askAnswered?: boolean
    mask?: string // technically a char but typescript does not have a char

    // The following  will be mapped to inquirer formats
    choices?: Array<string | number | choiceObject | choiceSeparatorType>
    validate?: functionExpression
    when?: functionExpression

    // The following is codeZero extensions and they will be removed
    // from the final inquire data structure
    c6o?: c6oExtensions
}

export type inquireType = inquireStep | Array<inquireStep>

// A section allows the developer to group
// questions on the web ui or cli and
export interface section {
    title: string
    inquire: inquireType
}

// A step defines a collection of
// sections (inquirer questions grouped around a title)
// or inquirer questions
export interface step {
    name: string
    sections?: Array<section>
    inquire?: inquireType
    skip?: string
}

// This is the entry point
// where all the magic starts
export type steps = step | Array<step>

export interface result {
    transient: { [key: string]: string }
    config: { [key: string]: string }
    secret: { [key: string]: string }
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