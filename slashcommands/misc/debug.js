const Discord = require('discord.js');
const ee = require('../../config/embed.json');

module.exports = {
    name: 'debug',
    description: 'Help debug your code and find potential issues.',
    options: [
        {
            name: 'code',
            description: 'The code you want to debug (use code blocks)',
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
    usage: '/debug <code> [language]',
    execute(interaction) {
        const code = interaction.options.getString('code');
        const language = interaction.options.getString('language') || 'general';

        const debugTips = {
            python: [
                '🔍 **Common Python Issues:**',
                '• Check for indentation errors (use 4 spaces)',
                '• Verify variable names are spelled correctly',
                '• Look for missing colons after if/for/while statements',
                '• Check for unmatched parentheses or brackets',
                '• Ensure proper string quotes (single or double)',
                '• Use `print()` statements to trace execution'
            ],
            javascript: [
                '🔍 **Common JavaScript Issues:**',
                '• Check browser console for error messages',
                '• Verify semicolons and bracket matching',
                '• Look for undefined variables or functions',
                '• Check for typos in method names',
                '• Use `console.log()` to debug values',
                '• Ensure DOM elements exist before accessing them'
            ],
            java: [
                '🔍 **Common Java Issues:**',
                '• Check for missing semicolons',
                '• Verify class and method names match file names',
                '• Look for unmatched braces { }',
                '• Check variable declarations and types',
                '• Ensure proper import statements',
                '• Use `System.out.println()` for debugging'
            ],
            cpp: [
                '🔍 **Common C++ Issues:**',
                '• Check for missing semicolons',
                '• Verify #include statements',
                '• Look for unmatched braces or parentheses',
                '• Check pointer and reference usage',
                '• Ensure proper memory management',
                '• Use `cout` statements for debugging'
            ],
            csharp: [
                '🔍 **Common C# Issues:**',
                '• Check for missing semicolons',
                '• Verify using statements',
                '• Look for unmatched braces',
                '• Check variable types and declarations',
                '• Ensure proper namespace usage',
                '• Use `Console.WriteLine()` for debugging'
            ],
            general: [
                '🔍 **General Debugging Tips:**',
                '• Read error messages carefully',
                '• Check syntax and spelling',
                '• Use print/log statements to trace execution',
                '• Break down complex problems into smaller parts',
                '• Check variable values at different points',
                '• Look for logic errors in conditions'
            ]
        };

        const tips = debugTips[language] || debugTips.general;

        const embed = new Discord.EmbedBuilder()
            .setColor(0x008080)
            .setTitle('🐛 Code Debugging Assistant')
            .setDescription('Here are some debugging tips for your code:')
            .addFields(
                {
                    name: '📝 Your Code',
                    value: code.length > 1000 ? code.substring(0, 1000) + '...' : code,
                    inline: false
                },
                {
                    name: '🔧 Debugging Checklist',
                    value: tips.join('\n'),
                    inline: false
                },
                {
                    name: '💡 Next Steps',
                    value: '1. Try the suggestions above\n2. Use debugging tools in your IDE\n3. Ask for help in the appropriate channel\n4. Share the specific error message if you have one',
                    inline: false
                }
            )
            .setFooter({ text: ee.footertext, iconURL: ee.footericon });

        interaction.reply({ embeds: [embed] });
    }
};
