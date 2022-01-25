import { keyValue } from '@c6o/kubeclient-contracts'
import { PromptType, Prompt, Section, isFunctionString, AppEngineAppHelper, AppEngineAppResource } from '@provisioner/appengine-contracts'
import createDebug from 'debug'
const debug = createDebug('@appengine:Validation')

export class PromptValidation {

    // returns true if the prompt is valid
    private validateIfIsRequiredAndHasANonEmptyValue(prompt: Prompt) {

        // is it required at all?
        if (typeof prompt.c6o?.required == 'undefined') return true
        if (prompt.c6o?.required == false) return true

        // it is required, and (it is defined OR has an empty value)
        const invalid =
            prompt.c6o?.required === true &&
            (
                typeof prompt.c6o?.value == 'undefined' ||
                prompt.c6o?.value === ''
            )
        return !invalid
    }

    private validateInput(prompt: Prompt, invalidPrompts: Array<Prompt>) {
        if (!this.validateIfIsRequiredAndHasANonEmptyValue(prompt)) {
            invalidPrompts.push(prompt)
            return
        }
    }
    private validateNumber(prompt: Prompt, invalidPrompts: Array<Prompt>) {
        // do we have a value?
        // if yes, do we have a min and max
        // if yes, check to make sure it is within min and max
        // if it is NOT within min and max, INVALID

        // otherwise
        // if it is required, INVALID

        if (prompt.c6o.value) {
            // we have a value
            if (prompt.c6o?.min) if (prompt.c6o?.value < prompt.c6o?.min) invalidPrompts.push(prompt)
            if (prompt.c6o?.max) if (prompt.c6o?.value > prompt.c6o?.max) invalidPrompts.push(prompt)
        } else {
            if (!this.validateIfIsRequiredAndHasANonEmptyValue(prompt)) invalidPrompts.push(prompt)
        }
    }

    public validatePrompt(document: AppEngineAppResource, answers: keyValue, prompt: Prompt) : boolean {
        const invalidPrompts = new Array<Prompt>()
        this.validatePromptInternal(document, answers, prompt, invalidPrompts)
        return invalidPrompts.length == 0
    }

    private validatePromptInternal(document: AppEngineAppResource, answers: keyValue, prompt: Prompt, invalidPrompts: Array<Prompt>) {
        if (prompt.validate && isFunctionString(prompt.validate)) {
            try {
                const func = new Function('value', 'answers', prompt.validate)
                const result = func.call(document, prompt.c6o?.value, answers)
                debug('Validation Evaluated for prompt', prompt, result)
                // intentionally left in for 3rd party developers working on their own provisioners
                if(!result) {
                    // intentionally left in for 3rd party developers working on their own provisioners
                    invalidPrompts.push(prompt)
                    return
                }
            }
            catch(e) {
                // intentionally left in for 3rd party developers working on their own provisioners
                invalidPrompts.push(prompt)
                throw e
            }
        }

        switch (prompt.type) {
            case 'number':
                this.validateNumber(prompt, invalidPrompts)
                break
            default:
                this.validateInput(prompt, invalidPrompts)
                break
        }
    }

    private validatePromptType(manifestHelper: AppEngineAppHelper, prompt: PromptType, invalidPrompts: Prompt[]) {
        if (typeof prompt == 'undefined') return //if we have no prompts, it is valid
        if (Array.isArray(prompt))
            for (const p of prompt)
                this.validatePromptInternal(manifestHelper.resource, manifestHelper.answers, p, invalidPrompts)
        else
            this.validatePromptInternal(manifestHelper.resource, manifestHelper.answers, prompt, invalidPrompts)
    }

    private validateSectionPrompts(manifestHelper: AppEngineAppHelper, sections: Section[], invalidPrompts: Array<Prompt>) {
        if (typeof sections == 'undefined') return // if we have no sections, it is valid
        for (const section of sections)
            this.validatePromptType(manifestHelper, section.prompts, invalidPrompts)
    }

    public validateSectionAndPrompts(manifestHelper: AppEngineAppHelper, sections: Section[], prompts: PromptType): Array<Prompt> {
        const invalidPrompts: Prompt[] = new Array<Prompt>()
        if (sections)
            this.validateSectionPrompts(manifestHelper, sections, invalidPrompts)
        else
            this.validatePromptType(manifestHelper, prompts, invalidPrompts)

        return invalidPrompts
    }
}
