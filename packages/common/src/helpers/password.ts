import { generate, GenerateOptions } from 'generate-password'

const defaultOptions = {
    strict: true,
    length: 18,
    numbers: true,
    uppercase: true,
    excludeSimilarCharacters: true
}

export const generatePassword = (options: GenerateOptions = defaultOptions) =>
    generate(options)

export const processPassword = (option?: GenerateOptions | string) =>
    option ?
    (typeof option == 'string' ?  option : generatePassword(option)) :
    generatePassword() // Generate using default options