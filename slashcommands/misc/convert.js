const Discord = require('discord.js');
const ee = require('../../config/embed.json');

module.exports = {
    name: 'convert',
    description: 'Convert code from one language to another.',
    options: [
        {
            name: 'from',
            description: 'Source language',
            required: true,
            type: 3,
            choices: [
                { name: 'Python', value: 'python' },
                { name: 'JavaScript', value: 'javascript' },
                { name: 'Java', value: 'java' },
                { name: 'C++', value: 'cpp' },
                { name: 'C#', value: 'csharp' }
            ]
        },
        {
            name: 'to',
            description: 'Target language',
            required: true,
            type: 3,
            choices: [
                { name: 'Python', value: 'python' },
                { name: 'JavaScript', value: 'javascript' },
                { name: 'Java', value: 'java' },
                { name: 'C++', value: 'cpp' },
                { name: 'C#', value: 'csharp' }
            ]
        },
        {
            name: 'code',
            description: 'Code to convert (use code blocks)',
            required: true,
            type: 3
        }
    ],
    usage: '/convert <from> <to> <code>',
    execute(interaction) {
        const fromLang = interaction.options.getString('from');
        const toLang = interaction.options.getString('to');
        const code = interaction.options.getString('code');

        if (fromLang === toLang) {
            return interaction.reply({ content: 'Source and target languages cannot be the same!', ephemeral: true });
        }

        const conversionTips = {
            'python-javascript': {
                tips: [
                    '• `print()` → `console.log()`',
                    '• `len()` → `.length`',
                    '• `range()` → `for (let i = 0; i < n; i++)`',
                    '• `def function():` → `function name() {}`',
                    '• Indentation → Curly braces `{}`',
                    '• `True/False` → `true/false`'
                ]
            },
            'javascript-python': {
                tips: [
                    '• `console.log()` → `print()`',
                    '• `.length` → `len()`',
                    '• `for (let i...)` → `for i in range():`',
                    '• `function name() {}` → `def name():`',
                    '• Curly braces `{}` → Indentation',
                    '• `true/false` → `True/False`'
                ]
            },
            'python-java': {
                tips: [
                    '• `print()` → `System.out.println()`',
                    '• `def function():` → `public static returnType name()`',
                    '• Dynamic typing → Static typing',
                    '• `len()` → `.length`',
                    '• `True/False` → `true/false`',
                    '• Add semicolons `;` at end of statements'
                ]
            },
            'java-python': {
                tips: [
                    '• `System.out.println()` → `print()`',
                    '• `public static...` → `def function():`',
                    '• Static typing → Dynamic typing',
                    '• `.length` → `len()`',
                    '• `true/false` → `True/False`',
                    '• Remove semicolons and use indentation'
                ]
            }
        };

        const conversionKey = `${fromLang}-${toLang}`;
        const tips = conversionTips[conversionKey] || [
            '• Check syntax differences between languages',
            '• Convert data types appropriately',
            '• Adjust function/method declarations',
            '• Handle language-specific features',
            '• Test the converted code thoroughly'
        ];

        const embed = new Discord.EmbedBuilder()
            .setColor(0x008080)
            .setTitle(`🔄 Code Conversion: ${fromLang.charAt(0).toUpperCase() + fromLang.slice(1)} → ${toLang.charAt(0).toUpperCase() + toLang.slice(1)}`)
            .setDescription('Here\'s guidance for converting your code:')
            .addFields(
                {
                    name: '📝 Original Code',
                    value: code.length > 800 ? code.substring(0, 800) + '...' : code,
                    inline: false
                },
                {
                    name: '🔧 Conversion Tips',
                    value: tips.join('\n'),
                    inline: false
                },
                {
                    name: '⚠️ Important Notes',
                    value: '• Some features may not have direct equivalents\n• Consider language-specific best practices\n• Test thoroughly after conversion\n• May need to restructure logic for optimal results',
                    inline: false
                },
                {
                    name: '🎯 Next Steps',
                    value: '1. Apply the conversion tips above\n2. Check language documentation for specifics\n3. Test your converted code\n4. Ask for help with specific conversion challenges',
                    inline: false
                }
            )
            .setFooter({ text: ee.footertext, iconURL: ee.footericon });

        interaction.reply({ embeds: [embed] });
    }
};
