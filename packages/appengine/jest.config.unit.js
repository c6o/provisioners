//export default {
module.exports = {
    'roots': [
        '<rootDir>/src'
    ],
    'testMatch': [
        '**/?(*.)+(unit).+(ts)',
    ],
    'transform': {
        '^.+\\.(ts|tsx)$': 'ts-jest',
    },
    'reporters': [
        'default',
        ['jest-html-reporters', {
            'publicPath': './coverage',
            'filename': 'report.html',
            'expand': true,
        }],
    ],
    setupFiles: ['<rootDir>/jestsetup.js'],
}
