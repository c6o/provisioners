
//export default {
// eslint-disable-next-line no-undef
module.exports = {
    'testMatch': [
        '**/?(*.)+(unit).+(ts)'
    ],
    'transform': {
        '^.+\\.(ts|tsx)$': 'ts-jest'
    },
    'reporters': [
        'default',
        ['jest-html-reporters', {
            'publicPath': './coverage',
            'filename': 'report.html',
            'expand': true,
        }],
    ]
}
