const Discord = require('discord.js');
const ee = require('../../config/embed.json');

module.exports = {
    name: 'explain',
    description: 'Get a detailed explanation of how code works.',
    options: [
        {
            name: 'code',
            description: 'The code you want explained (use code blocks)',
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
    usage: '/explain <code> [language]',
    execute(interaction) {
        const code = interaction.options.getString('code');
        const language = interaction.options.getString('language') || 'general';

        const embed = new Discord.EmbedBuilder()
            .setColor(0x008080)
            .setTitle('📚 Code Explanation')
            .setDescription('Here\'s a breakdown of your code:')
            .addFields(
                {
                    name: '📝 Your Code',
                    value: code.length > 800 ? code.substring(0, 800) + '...' : code,
                    inline: false
                },
                {
                    name: '🔍 How to Analyze Code',
                    value: '• **Read line by line**: Start from the top and work down\n• **Identify patterns**: Look for loops, conditions, functions\n• **Trace variables**: Follow how values change\n• **Understand flow**: See how execution moves through the code\n• **Check inputs/outputs**: What goes in and what comes out',
                    inline: false
                },
                {
                    name: '💡 Understanding Tips',
                    value: '• Break complex expressions into smaller parts\n• Look up unfamiliar functions or methods\n• Use debugging tools to step through execution\n• Draw diagrams for complex logic\n• Ask specific questions about confusing parts',
                    inline: false
                },
                {
                    name: '🎯 Next Steps',
                    value: '1. Try to explain each line in your own words\n2. Run the code and observe the output\n3. Modify small parts to see how it changes\n4. Ask for help with specific lines you don\'t understand',
                    inline: false
                }
            )
            .setFooter({ text: ee.footertext, iconURL: ee.footericon });

        interaction.reply({ embeds: [embed] });
    }
};
