// eslint-disable-next-line no-undef
module.exports = {
    'roots': [
        './src',
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
}