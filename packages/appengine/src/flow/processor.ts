import { generate } from 'generate-password'
import * as contracts from '../contracts'
import chalk from 'chalk'
import createDebug from 'debug'

const debug = createDebug('@appengine:FlowProcessor')

export class FlowProcessor {

    responses: any = {}
    extensionsMap = new Map<string, contracts.c6oExtensions>()
    generates = new Map<string, contracts.generatorOptions>()

    /**
     * Creates a flow processor
     * @param inquirer Inquirer instance to use
     * @param fnContext The 'this' value sent to all functions in the steps
     */
    constructor(private inquirer, private fnContext) { }

    async process(steps: contracts.Flow): Promise<contracts.FlowResult> {
        const result: contracts.FlowResult = {
            transient: {},
            configs: {},
            secrets: {}
        }

        // Extract the responses and extensions from steps
        if (steps !== '$unset')
        {
            for (const step of contracts.each(steps))
                await this.processStep(step)

            this.postProcessGenerates()


            // Post process the results into the various target
            // in the results object - we use the extensionsMap for this
            for(const pair of this.extensionsMap) {
                const [stepName, ext] = pair
                debug('Post processing step %s %o', stepName, ext)
                const target = ext?.target || 'config'
                result[target][stepName] = this.responses[stepName]
            }
        }

        return result
    }

    async processStep(step: contracts.Step) {
        step.name = step.name || 'main'
        debug('Processing step %s', step.name)

        if (this.extensionsMap.has(step.name))
            throw new Error(`Step name ${step.name} already exists`)

        if (step.skip) {
            debug('Processing skip function %o', step.skip)
            const skipFunction =  new Function('answers',  step.skip)
            const skip = skipFunction.call(this.fnContext, this.responses)
            debug('Skip function says %s', skip)
            if (skip)
                return
        }

        if (step.sections)
            for (const section of step.sections)
                await this.processSection(section)
        else if (step.prompts)
            await this.processInquire(step.prompts)
        else
            throw new Error(`Step ${step.name} lacks any sections or inquire`)
    }

    async processSection(section: contracts.Section) {
        debug('Processing section %s', section.title)

        // We can't use console.log because vorpal does something
        // to console.log so we write directly to stdout
        process.stdout.write(chalk.yellowBright.bold('\n❯ Section: ') + chalk.yellowBright(section.title) + '\n\n')
        await this.processInquire(section.prompts)
    }

    async processInquire(inquireField: contracts.PromptType) {
        const inquireFields = Array.isArray(inquireField) ?
            inquireField :
            [inquireField]


        const asks = inquireFields.reduce(this.convertPrompts.bind(this), new Array<contracts.InquirePrompt>())
        const responses = await this.inquirer.prompt(asks)

        // Add to the responses bag - new responses overwrite old responses
        this.responses = {
            ...this.responses,
            ...responses
        }
    }

    /**
     * Converts c6oPrompt to inquirePrompt
     * @param prompt
     */
    convertPrompts(prompts: contracts.InquirePrompt[], prompt: contracts.Prompt) {
        debug('Mapping from %o', prompt)

        // Inquire is forgiving and ignores fields it doesn't understand
        // but let's be good and strip out c6o
        const { c6o, ...inquire } = prompt

        this.handleValidate(inquire)
        this.handleWhen(inquire)
        this.handleChoices(inquire)

        this.handlePassword(prompt)
        // Has to come after When above
        this.handleGenerate(inquire, c6o, prompts)

        // Stash the extensions
        this.extensionsMap.set(inquire.name, c6o)

        // Add the prompt to the prompts array and return the array
        debug('Mapped to %o', inquire)
        prompts.push(inquire)
        return prompts
    }

    /**
     * Convert validate strings to function (value, answers) => predicate
     * @param prompt
     */
    handleValidate(prompt: contracts.InquirePrompt) {
        if (contracts.isFunctionString(prompt.validate))
            prompt.validate = new Function('value', 'answers', prompt.validate).bind(this.fnContext)
    }

    /**
     * Convert when strings to function (answers) => predicate
     * @param prompt
     */
    handleWhen(prompt: contracts.InquirePrompt) {
        if (contracts.isFunctionString(prompt.when))
            prompt.when = new Function('answers', prompt.when).bind(this.fnContext)
    }

    /**
     * For choices, we have to convert separator strings to the separator object
     * @param prompt
     */
    handleChoices(prompt: contracts.InquirePrompt) {
        if (prompt.choices)
            prompt.choices = prompt.choices.map(choice =>
                    choice === contracts.choiceSeparator ?
                        new this.inquirer.Separator() :
                        choice
            )
    }

    /**
     * Ensure passwords have a mask and target secrets
     * @param step
     */
    handlePassword(step: contracts.Prompt) {
        if (step.type === 'password') {
            if (!step.mask)
                step.mask = '*'
            if (step.c6o)
                step.c6o.target = 'secret' // passwords have to be secret
        }
    }

    /**
     * Adds a pre-prompt if the field allows a generated answer
     * @param inquire
     * @param prompts
     */
    handleGenerate(inquire: contracts.InquirePrompt, c6o: contracts.c6oExtensions, prompts: contracts.InquirePrompt[]) {
        if (c6o?.generate) {
            const queryName = `${inquire.name}-C60-GENERATE`

            // Prompt the user if they would like to use a generated value
            const query: contracts.InquirePrompt = {
                type: 'confirm',
                name: queryName,
                default: true,
                message: c6o.generateMessage || `Generate a value for ${inquire.name}`,
                 // Only execute when the underlying prompt executes
                ...(inquire.when ? { when: inquire.when } : undefined)
            }

            // Don't show the prompt if the user wants a generated value
            inquire.when = (answers) => !answers[queryName]

            this.generates.set(inquire.name, c6o.generate)

            debug('Injecting query %o', query)
            // Inject the query to the prompts list
            prompts.push(query)
        }
    }

    postProcessGenerates() {
        for(const pair of this.generates) {
            const [stepName, generateOptions] = pair
            debug('Post processing generate step %s %o', stepName, generate)
            this.responses[stepName] = generate(generateOptions)
        }
    }
}