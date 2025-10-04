const Discord = require('discord.js');
const ee = require('../../config/embed.json');

module.exports = {
    name: 'optimize',
    description: 'Get suggestions to optimize and improve your code.',
    options: [
        {
            name: 'code',
            description: 'The code you want to optimize (use code blocks)',
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
                { name: 'C++', value: 'cpp' },
                { name: 'C#', value: 'csharp' },
                { name: 'Other', value: 'other' }
            ]
        }
    ],
    usage: '/optimize <code> [language]',
    execute(interaction) {
        const code = interaction.options.getString('code');
        const language = interaction.options.getString('language') || 'general';

        const optimizationTips = {
            python: [
                '• Use list comprehensions instead of loops when possible',
                '• Avoid repeated function calls in loops',
                '• Use `set()` for membership testing instead of lists',
                '• Consider using `enumerate()` instead of `range(len())`',
                '• Use `join()` for string concatenation in loops',
                '• Cache expensive function results with `@lru_cache`'
            ],
            javascript: [
                '• Use `const` and `let` instead of `var`',
                '• Minimize DOM queries by caching elements',
                '• Use event delegation for multiple similar elements',
                '• Avoid creating functions inside loops',
                '• Use `===` instead of `==` for comparisons',
                '• Consider using `map()`, `filter()`, `reduce()` for arrays'
            ],
            java: [
                '• Use StringBuilder for multiple string concatenations',
                '• Initialize collections with appropriate capacity',
                '• Use enhanced for loops when index isn\'t needed',
                '• Consider using streams for data processing',
                '• Avoid creating unnecessary objects in loops',
                '• Use appropriate data structures (HashMap vs TreeMap)'
            ],
            cpp: [
                '• Use references instead of copying large objects',
                '• Reserve vector capacity when size is known',
                '• Use `const` wherever possible',
                '• Prefer pre-increment over post-increment',
                '• Use smart pointers for memory management',
                '• Consider move semantics for expensive operations'
            ],
            csharp: [
                '• Use StringBuilder for multiple string concatenations',
                '• Use `var` for local variables when type is obvious',
                '• Consider LINQ for data processing',
                '• Use `using` statements for disposable resources',
                '• Cache expensive property calculations',
                '• Use appropriate collection types (List vs Array)'
            ],
            general: [
                '• Eliminate redundant calculations',
                '• Use appropriate data structures',
                '• Minimize nested loops when possible',
                '• Cache frequently accessed values',
                '• Remove unused variables and code',
                '• Consider algorithmic improvements'
            ]
        };

        const tips = optimizationTips[language] || optimizationTips.general;

        const embed = new Discord.EmbedBuilder()
            .setColor(0x008080)
            .setTitle('⚡ Code Optimization Assistant')
            .setDescription('Here are suggestions to improve your code performance:')
            .addFields(
                {
                    name: '📝 Your Code',
                    value: code.length > 800 ? code.substring(0, 800) + '...' : code,
                    inline: false
                },
                {
                    name: '🚀 Optimization Tips',
                    value: tips.join('\n'),
                    inline: false
                },
                {
                    name: '📊 Performance Considerations',
                    value: '• **Time Complexity**: Can you reduce O(n²) to O(n)?\n• **Space Complexity**: Are you using unnecessary memory?\n• **Readability**: Don\'t sacrifice clarity for minor gains\n• **Premature Optimization**: Profile first, optimize bottlenecks',
                    inline: false
                },
                {
                    name: '🎯 Next Steps',
                    value: '1. Identify the slowest parts of your code\n2. Apply relevant optimizations\n3. Test performance before and after\n4. Ensure functionality remains correct',
                    inline: false
                }
            )
            .setFooter({ text: ee.footertext, iconURL: ee.footericon });

        interaction.reply({ embeds: [embed] });
    }
};
