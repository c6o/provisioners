import * as contracts from '../contracts'

const simpleInquire: contracts.PromptType = {
    type: 'input',
    name: 'simpleValue'
}

// From: https://github.com/SBoudrias/Inquirer.js/tree/master/packages/inquirer/examples
const multiInquire: contracts.PromptType = [
    {
        type: 'checkbox',
        name: 'Checkbox',
        choices: [
            contracts.choiceSeparator,
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
            contracts.choiceSeparator, //new inquirer.Separator(' = The Cheeses = '),
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
            contracts.choiceSeparator, //new inquirer.Separator(' = The usual ='),
            {
                name: 'Mushroom',
            },
            {
                name: 'Tomato',
            },
            contracts.choiceSeparator, //new inquirer.Separator(' = The extras = '),
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
            contracts.choiceSeparator,
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
            contracts.choiceSeparator,
            'Ask opening hours',
            'Talk to the receptionist',
        ],
    }
]

export const simpleInquireStep: contracts.Steps = {
    name: 'main',
    prompts: simpleInquire
}

export const multiInquireStep: contracts.Steps = {
    name: 'main',
    prompts: multiInquire
}

export const sectionedSteps: contracts.Steps = [{
    name: 'main',
    sections: [
        {
            title: 'This is a section',
            prompts: simpleInquire
        },
        {
            title: 'This is another section',
            prompts: multiInquire
        }
    ]
}]

export const skippedSteps: contracts.Steps = [
    {
        name: 'main',
        prompts: simpleInquire
    },
    {
        name: 'conditional',
        skip: 'return answers.simpleValue === "skip"',
        prompts: multiInquire
    }
]