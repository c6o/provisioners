import * as contracts from './contracts'
import chalk from 'chalk'
import createDebug from 'debug'

const debug = createDebug('@appengine:FlowProcessor')

export class FlowProcessor {

    inquireResponses: any = {}
    inquireExtensions = new Map<string, contracts.c6oExtensions>()

    constructor(private inquirer, private document) { }

    async process(steps: contracts.steps): Promise<contracts.result> {

        // Extract the responses and extensions from steps
        for (const step of contracts.each(steps))
            await this.processStep(step)

        const result: contracts.result = {
            transient: {},
            config: {},
            secret: {}
        }

        for(const pair of this.inquireExtensions) {
            const [stepName, ext] = pair
            debug('Post processing step %s %o', stepName, ext)
            const target = ext?.target || 'config'
            result[target][stepName] = this.inquireResponses[stepName]
        }

        return result
    }

    async processStep(step: contracts.step) {
        debug('Processing step %s', step.name)

        if (step.skip) {
            debug('Processing skip function %o', step.skip)
            const skipFunction =  new Function('answers',  step.skip)
            const skip = skipFunction.call(this.document, this.inquireResponses)
            debug('Skip function says %s', skip)
            if (skip)
                return
        }

        if (step.sections)
            for (const section of step.sections)
                await this.processSection(section)
        else if (step.inquire)
            await this.processInquire(step.inquire)
        else
            throw new Error(`Step ${step.name} lacks any sections or inquire`)
    }

    async processSection(section: contracts.section) {
        debug('Processing section %s', section.title)

        // We can't use console.log because vorpal does something
        // to console.log so we write directly to stdout
        process.stdout.write(chalk.yellowBright.bold('\n❯ Section: ') + chalk.yellowBright(section.title) + '\n\n')
        await this.processInquire(section.inquire)
    }

    async processInquire(inquireField: contracts.inquireType) {
        const inquireFields = Array.isArray(inquireField) ?
            inquireField :
            [inquireField]

        const asks = inquireFields.map(item => this.mapInquire(item))
        const responses = await this.inquirer.prompt(asks)

        // Add to the responses bag
        this.inquireResponses = {
            ...this.inquireResponses,
            ...responses
        }
    }

    /**
     * Maps from a Flow.inquireType item to inquire.prompt items
     * @param inquireItem
     */
    mapInquire(inquireItem: contracts.inquireStep) {
        debug('Mapping from %o', inquireItem)

        // Inquire is forgiving and ignores fields it doesn't understand
        // but let's be good and strip out c6o
        const { c6o, ...rest } = inquireItem

        if (contracts.isFunctionString(rest.validate))
            rest.validate = new Function('value', 'answers', rest.validate).bind(this.document)

        if (contracts.isFunctionString(rest.when))
            rest.when = new Function('answers', rest.when).bind(this.document)

        if (rest.type === 'password' && !rest.mask)
            rest.mask = '*'

        // For choices, we have to convert separator strings to the separator object
        if (rest.choices)
            rest.choices = rest.choices.map(choice =>
                choice === contracts.choiceSeparator ?
                    new this.inquirer.Separator() :
                    choice
            )

        // Stash the extensions
        this.inquireExtensions.set(rest.name, c6o)

        debug('Mapped to %o', rest)
        return rest
    }
}