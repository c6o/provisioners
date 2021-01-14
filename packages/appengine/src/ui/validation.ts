import { PromptType, Prompt, Section } from '@provisioner/appengine-contracts'

export class PromptValidation {


    //returns true if the prompt is valid
    private validateIfIsRequiredAndHasANonEmptyValue(prompt: Prompt) {

        //is it required at all?
        if (typeof prompt.c6o?.required == 'undefined') return true
        if (prompt.c6o?.required == false) return true

        //it is required, and (it is defined OR has an empty value)
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

        //do we have a value?
            //if yes, do we have a min and max
                //if yes, check to make sure it is within min and max
                    //if it is NOT within min and max, INVALID

        //otherwise
            //if it is required, INVALID

        if(typeof prompt.c6o.value != 'undefined') {
            //we have a value
            if(prompt.c6o?.min) if(prompt.c6o?.value < prompt.c6o?.min) invalidPrompts.push(prompt)
            if(prompt.c6o?.max) if(prompt.c6o?.value > prompt.c6o?.max) invalidPrompts.push(prompt)

        } else {
            if(!this.validateIfIsRequiredAndHasANonEmptyValue(prompt)) invalidPrompts.push(prompt)
        }


    }

    private validatePrompt(prompt: Prompt, invalidPrompts: Array<Prompt>) {

        switch (prompt.type) {
            //text input
            case 'number':
                this.validateNumber(prompt, invalidPrompts)
                break
            default:
                this.validateInput(prompt, invalidPrompts)
                break
        }
    }

    private validatePromptType(prompt: PromptType, invalidPrompts: Prompt[]) {
        if (typeof prompt == 'undefined') return //if we have no prompts, it is valid
        if (Array.isArray(prompt))
            for (const p of prompt)
                this.validatePrompt(p, invalidPrompts)
        else
            this.validatePrompt(prompt, invalidPrompts)
    }
    private validateSectionPrompts(sections: Section[], invalidPrompts: Array<Prompt>) {
        if (typeof sections == 'undefined') return //if we have no sections, it is valid
        for (const section of sections) {
            this.validatePromptType(section.prompts, invalidPrompts)
        }
    }

    public validateSectionAndPrompts(sections: Section[], prompts: PromptType): Array<Prompt> {
        const invalidPrompts: Prompt[] = new Array<Prompt>()
        if (sections) {
            this.validateSectionPrompts(sections, invalidPrompts)
        } else {
            this.validatePromptType(prompts, invalidPrompts)
        }
        return invalidPrompts
    }
}