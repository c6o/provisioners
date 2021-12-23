
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
    ],
    globals: {
        'ts-jest': {
            tsconfig: {
                "composite": true,
                "module": "commonjs",
                "moduleResolution": "node",
                "declaration": true,
                "noImplicitAny": false,
                "removeComments": true,
                "noLib": false,
                "emitDecoratorMetadata": true,
                "experimentalDecorators": true,
                "esModuleInterop": true,
                "skipLibCheck": true,
                "target": "es2018",
                "sourceMap": true,
                "lib": ["es2018", "dom"]
            }
        },
    },
    setupFiles: ['<rootDir>/jestsetup.js'],
}
