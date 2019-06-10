import * as generator from 'generate-password'

const defaultOptions = {
    strict: true,
    length: 18,
    numbers: true,
    uppercase: true,
    excludeSimilarCharacters: true
}

export function generatePassword(options = defaultOptions) {
    return generator.generate(options)
}

/**
 * 
 * @param option Is either a password or passwordOptions for generatePassword
 * @returns password
 */
export function processPassword(option) {
    return option ? 
        (typeof option == 'string' ?  option : generatePassword(option)) :
        generatePassword() 
}