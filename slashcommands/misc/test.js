const Discord = require('discord.js');
const ee = require('../../config/embed.json');

module.exports = {
    name: 'test',
    description: 'Generate unit tests for your code.',
    options: [
        {
            name: 'code',
            description: 'Code to generate tests for (use code blocks)',
            required: true,
            type: 3
        },
        {
            name: 'language',
            description: 'Programming language',
            required: false,
            type: 3,
            choices: [
                { name: 'Python', value: 'python' },
                { name: 'JavaScript', value: 'javascript' },
                { name: 'Java', value: 'java' },
                { name: 'C#', value: 'csharp' },
                { name: 'General', value: 'general' }
            ]
        }
    ],
    usage: '/test <code> [language]',
    execute(interaction) {
        const code = interaction.options.getString('code');
        const language = interaction.options.getString('language') || 'general';

        const testingFrameworks = {
            python: {
                framework: 'pytest / unittest',
                example: '```python\nimport pytest\n\n# Example function to test\ndef add(a, b):\n    return a + b\n\n# Test cases\ndef test_add_positive_numbers():\n    assert add(2, 3) == 5\n\ndef test_add_negative_numbers():\n    assert add(-1, -1) == -2\n\ndef test_add_zero():\n    assert add(5, 0) == 5\n    assert add(0, 0) == 0\n\ndef test_add_mixed():\n    assert add(-5, 10) == 5\n\n# Run with: pytest test_file.py\n```'
            },
            javascript: {
                framework: 'Jest / Mocha',
                example: '```javascript\n// Example function to test\nfunction add(a, b) {\n    return a + b;\n}\n\n// Jest test cases\ndescribe(\'add function\', () => {\n    test(\'adds positive numbers\', () => {\n        expect(add(2, 3)).toBe(5);\n    });\n    \n    test(\'adds negative numbers\', () => {\n        expect(add(-1, -1)).toBe(-2);\n    });\n    \n    test(\'adds with zero\', () => {\n        expect(add(5, 0)).toBe(5);\n        expect(add(0, 0)).toBe(0);\n    });\n    \n    test(\'handles mixed signs\', () => {\n        expect(add(-5, 10)).toBe(5);\n    });\n});\n\n// Run with: npm test\n```'
            },
            java: {
                framework: 'JUnit',
                example: '```java\nimport org.junit.jupiter.api.Test;\nimport static org.junit.jupiter.api.Assertions.*;\n\npublic class CalculatorTest {\n    \n    // Example method to test\n    public int add(int a, int b) {\n        return a + b;\n    }\n    \n    @Test\n    public void testAddPositiveNumbers() {\n        assertEquals(5, add(2, 3));\n    }\n    \n    @Test\n    public void testAddNegativeNumbers() {\n        assertEquals(-2, add(-1, -1));\n    }\n    \n    @Test\n    public void testAddWithZero() {\n        assertEquals(5, add(5, 0));\n        assertEquals(0, add(0, 0));\n    }\n    \n    @Test\n    public void testAddMixedSigns() {\n        assertEquals(5, add(-5, 10));\n    }\n}\n```'
            }
        };

        const testingTips = [
            '🎯 **Test Categories**\n• **Happy Path**: Normal, expected inputs\n• **Edge Cases**: Boundary values, empty inputs\n• **Error Cases**: Invalid inputs, exceptions',
            '📋 **Test Structure (AAA)**\n• **Arrange**: Set up test data\n• **Act**: Execute the function\n• **Assert**: Verify the result',
            '✅ **Good Test Practices**\n• One assertion per test (when possible)\n• Descriptive test names\n• Independent tests\n• Fast execution',
            '🔍 **What to Test**\n• Public methods/functions\n• Business logic\n• Error handling\n• Integration points'
        ];

        const framework = testingFrameworks[language];
        const frameworkText = framework ? `**${framework.framework}**\n${framework.example}` : 'Choose a testing framework appropriate for your language';

        const embed = new Discord.EmbedBuilder()
            .setColor(0x008080)
            .setTitle('🧪 Test Generation Assistant')
            .setDescription('Here\'s guidance for testing your code:')
            .addFields(
                {
                    name: '📝 Your Code',
                    value: code.length > 600 ? code.substring(0, 600) + '...' : code,
                    inline: false
                },
                {
                    name: '🛠️ Testing Framework Example',
                    value: frameworkText,
                    inline: false
                },
                {
                    name: '📚 Testing Guidelines',
                    value: testingTips.join('\n\n'),
                    inline: false
                },
                {
                    name: '🎯 Next Steps',
                    value: '1. Identify the functions to test\n2. Write tests for normal cases first\n3. Add edge case tests\n4. Test error conditions\n5. Run tests and verify they pass',
                    inline: false
                }
            )
            .setFooter({ text: ee.footertext, iconURL: ee.footericon });

        interaction.reply({ embeds: [embed] });
    }
};
