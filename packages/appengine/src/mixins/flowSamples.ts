import { Flow } from '../contracts'

const simpleInquire: Flow.inquireType = {
    type: 'input',
    name: 'value'
}

// From: https://github.com/SBoudrias/Inquirer.js/tree/master/packages/inquirer/examples
const multiInquire: Flow.inquireType = [
    {
        type: 'checkbox',
        name: 'value1',
        choices: [
            Flow.choiceSeparator,
            {
                name: 'Pepperoni',
            },
            {
                name: 'Ham',
            },
            {
                name: 'Ground Meat',
            },
            {
                name: 'Bacon',
            },
            Flow.choiceSeparator, //new inquirer.Separator(' = The Cheeses = '),
            {
                name: 'Mozzarella',
                checked: true,
            },
            {
                name: 'Cheddar',
            },
            {
                name: 'Parmesan',
            },
            Flow.choiceSeparator, //new inquirer.Separator(' = The usual ='),
            {
                name: 'Mushroom',
            },
            {
                name: 'Tomato',
            },
            Flow.choiceSeparator, //new inquirer.Separator(' = The extras = '),
            {
                name: 'Pineapple',
            },
            {
                name: 'Olives',
                disabled: 'out of stock',
            },
            {
                name: 'Extra cheese',
            },
        ]
    },
    {
        type: 'confirm',
        name: 'value2',
        choices: ['one', 'two', 'three']
    },
    {
        type: 'editor',
        name: 'value3'
    },
    {
        type: 'expand',
        name: 'value4',
        choices: [
            {
                key: 'y',
                name: 'Overwrite',
                value: 'overwrite',
            },
            {
                key: 'a',
                name: 'Overwrite this one and all next',
                value: 'overwrite_all',
            },
            {
                key: 'd',
                name: 'Show diff',
                value: 'diff',
            },
            Flow.choiceSeparator,
            {
                key: 'x',
                name: 'Abort',
                value: 'abort',
            },
        ]
    },
    {
        type: 'input',
        name: 'value5'
    },
    {
        type: 'list',
        name: 'value6',
        choices: ['Jumbo', 'Large', 'Standard', 'Medium', 'Small', 'Micro']
    },
    {
        type: 'number',
        name: 'value7'
    },
    {
        type: 'password',
        name: 'value8'
    },
    {
        type: 'rawlist',
        name: 'value9',
        choices: [
            'Order a pizza',
            'Make a reservation',
            Flow.choiceSeparator,
            'Ask opening hours',
            'Talk to the receptionist',
        ],
    }
]

export const simpleInquireStep: Flow.steps = {
    name: 'main',
    inquire: simpleInquire
}

export const multiInquireStep: Flow.steps = {
    name: 'main',
    inquire: multiInquire
}

export const sectionedSteps: Flow.steps = [{
    name: 'main'
}
]