import { Flow } from '../contracts'

const simpleInquire: Flow.inquireType = {
    type: 'input',
    name: 'simpleValue'
}

// From: https://github.com/SBoudrias/Inquirer.js/tree/master/packages/inquirer/examples
const multiInquire: Flow.inquireType = [
    {
        type: 'checkbox',
        name: 'Checkbox',
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
        name: 'Confirm',
    },
    {
        type: 'list',
        name: 'List',
        choices: ['Jumbo', 'Large', 'Standard', 'Medium', 'Small', 'Micro', 'skip-editor']
    },
    {
        type: 'editor',
        name: 'Editor',
        when: 'return answers.List !== "skip-editor"'
        // when: 'throw new Error(JSON.stringify(this))' // Test to show that this is the manifest
    },
    {
        type: 'expand',
        name: 'Expand',
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
        name: 'Input'
    },
    {
        type: 'number',
        name: 'Number'
    },
    {
        type: 'password',
        name: 'Password'
    },
    {
        type: 'rawlist',
        name: 'RawList',
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
    name: 'main',
    sections: [
        {
            title: 'This is a section',
            inquire: simpleInquire
        },
        {
            title: 'This is another section',
            inquire: multiInquire
        }
    ]
}]

export const skippedSteps: Flow.steps = [
    {
        name: 'main',
        inquire: simpleInquire
    },
    {
        name: 'conditional',
        skip: 'return answers.simpleValue === "skip"',
        inquire: multiInquire
    }
]