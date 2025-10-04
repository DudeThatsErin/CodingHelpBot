const Discord = require('discord.js');
const ee = require('../../config/embed.json');

module.exports = {
    name: 'performance',
    description: 'Analyze code performance and get optimization suggestions.',
    options: [
        {
            name: 'code',
            description: 'Code to analyze for performance (use code blocks)',
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
                { name: 'General', value: 'general' }
            ]
        }
    ],
    usage: '/performance <code> [language]',
    execute(interaction) {
        const code = interaction.options.getString('code');
        const language = interaction.options.getString('language') || 'general';

        const performanceChecklist = [
            '🔍 **Algorithm Complexity**\n• What\'s the time complexity (Big O)?\n• Can you reduce nested loops?\n• Are you using efficient data structures?',
            '💾 **Memory Usage**\n• Are you creating unnecessary objects?\n• Can you reuse variables?\n• Are there memory leaks?',
            '🔄 **Loop Optimization**\n• Move invariant calculations outside loops\n• Use appropriate loop types\n• Consider breaking early when possible',
            '📊 **Data Structure Choice**\n• Hash tables for O(1) lookups\n• Arrays for sequential access\n• Trees for hierarchical data',
            '🚀 **Language-Specific Tips**\n• Use built-in functions when available\n• Avoid premature optimization\n• Profile before optimizing'
        ];

        const embed = new Discord.EmbedBuilder()
            .setColor(0x008080)
            .setTitle('⚡ Performance Analysis')
            .setDescription('Here\'s a performance analysis of your code:')
            .addFields(
                {
                    name: '📝 Your Code',
                    value: code.length > 600 ? code.substring(0, 600) + '...' : code,
                    inline: false
                },
                {
                    name: '🔍 Performance Checklist',
                    value: performanceChecklist.join('\n\n'),
                    inline: false
                },
                {
                    name: '📈 Optimization Steps',
                    value: '1. **Profile first** - Identify actual bottlenecks\n2. **Measure baseline** - Record current performance\n3. **Optimize incrementally** - One change at a time\n4. **Test thoroughly** - Ensure correctness\n5. **Measure again** - Verify improvements',
                    inline: false
                },
                {
                    name: '⚠️ Common Performance Pitfalls',
                    value: '• Premature optimization\n• Ignoring algorithm complexity\n• Not profiling real usage\n• Optimizing the wrong parts\n• Sacrificing readability for minor gains',
                    inline: false
                }
            )
            .setFooter({ text: ee.footertext, iconURL: ee.footericon });

        interaction.reply({ embeds: [embed] });
    }
};
