import { Options as GeneratePasswordOptions } from 'generate-password'

export namespace Flow {

    export type functionExpression = string // this is an inline function that's turned into an expression

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
        password?: GeneratePasswordOptions
    }

    export interface inquireStep {
        type: 'input' | 'number' | 'confirm' | 'list' | 'rawlist' | 'expand' | 'checkbox' | 'password' | 'editor'
        name: string
        message?: string
        default?: string | number | boolean | Array<string | number | boolean>
        choices?: Array<string | number | choiceObject | choiceSeparatorType>
        askAnswered?: boolean
        mask?: string // technically a char but typescript does not have a char

        // The following mean something else to AppEngine and will be mapped
        validate?: string // this is a RegEx and will be converted to a function
        when?: functionExpression

        // The following is codeZero extensions and they will be removed
        // from the final inquire data structure
        c6o?: c6oExtensions
    }

    export type inquireType = inquireStep | Array<inquireStep>

    export interface section {
        title: string
        inquire: inquireType
    }

    export interface step {
        name: string
        sections?: Array<section>
        inquire?: inquireType
    }

    export type steps = step | Array<step>

    export function* each<T>(items: T | Array<T>) {
        if (!items)
            return // kills the generator and makes each(undefined) safe to run
        if (!Array.isArray(items))
            yield items
        else
            for(const item of items)
                yield item
    }
}

