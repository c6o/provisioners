import { generate, Options } from 'generate-password'

const defaultOptions = {
    strict: true,
    length: 18,
    numbers: true,
    uppercase: true,
    excludeSimilarCharacters: true
}

export const generatePassword = (options: Options = defaultOptions) =>
    generate(options)

export const processPassword = (option?: Options | string) =>
    option ?
    (typeof option == 'string' ?  option : generatePassword(option)) :
    generatePassword() // Generate using default options