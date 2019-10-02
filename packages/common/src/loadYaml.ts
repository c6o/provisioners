import * as yaml from 'js-yaml'
import * as fs from 'fs'
import * as path from 'path'
import * as callsite from 'callsite'
import * as Handlebars from 'handlebars'

export const loadYaml = (file, context = {}, depth = 1) => {
    const stack = callsite()
    const requester = path.dirname(stack[depth].getFileName())

    const source = fs.readFileSync(path.join(requester, file), 'utf8')
    const template = Handlebars.compile(source, {noEscape: true})
    const content = template(context)
    return yaml.safeLoad(content)
}