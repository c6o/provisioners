//export default {
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
    ],
    // preset: "ts-jest",
    // testEnvironment: "node",
    // moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    // TODO: needed for lit-element testing, not currenlty working.
    // transformIgnorePatterns: [
    //     "/node_modules/(?!(lit-element)/)",
    //     "/packages/common-ui/node_modules/(?!(lit-element)/)",
    // ],
    // needed for testing of interfaces using jest-ts-auto-mock
    /* Also needed in tsconfig.json is
    "plugins": [
        {
            "transform": "ts-auto-mock/transformer",
            "cacheBetweenTests": false
        }
    ]
     */
    // globals: {
    //     "ts-jest": {
    //         compiler: "ttypescript",
    //         tsConfig: {
    //             // allow js in typescript
    //             allowJs: true,
    //         },
    //     },
    //     diagnostics: {
    //         warnOnly: true,
    //     },
    // },
    // "setupFiles": [
    //     "<rootDir>config.mock.ts"
    // ]
}
