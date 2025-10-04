const Discord = require('discord.js');
const ee = require('../../config/embed.json');

module.exports = {
    name: 'practice',
    description: 'Get coding practice problems tailored to your level.',
    options: [
        {
            name: 'difficulty',
            description: 'Choose your skill level',
            required: true,
            type: 3,
            choices: [
                { name: 'Beginner', value: 'beginner' },
                { name: 'Intermediate', value: 'intermediate' },
                { name: 'Advanced', value: 'advanced' }
            ]
        },
        {
            name: 'language',
            description: 'Preferred programming language',
            required: false,
            type: 3,
            choices: [
                { name: 'Python', value: 'python' },
                { name: 'JavaScript', value: 'javascript' },
                { name: 'Java', value: 'java' },
                { name: 'C++', value: 'cpp' },
                { name: 'Any', value: 'any' }
            ]
        }
    ],
    usage: '/practice <difficulty> [language]',
    execute(interaction) {
        const difficulty = interaction.options.getString('difficulty');
        const language = interaction.options.getString('language') || 'any';

        const problems = {
            beginner: [
                '**Hello World Variations**\n• Print your name and age\n• Create a simple calculator\n• Convert temperature units',
                '**Basic Logic**\n• Check if a number is even/odd\n• Find the largest of three numbers\n• Create a simple guessing game',
                '**Loops & Lists**\n• Print numbers 1-100\n• Sum all numbers in a list\n• Count vowels in a string',
                '**Simple Functions**\n• Create a function to reverse a string\n• Make a basic password checker\n• Build a simple menu system'
            ],
            intermediate: [
                '**Data Structures**\n• Implement a stack or queue\n• Create a simple hash table\n• Build a basic linked list',
                '**Algorithms**\n• Binary search implementation\n• Bubble sort or selection sort\n• Find duplicates in an array',
                '**String Manipulation**\n• Palindrome checker\n• Anagram detector\n• Word frequency counter',
                '**File Operations**\n• Read and process CSV files\n• Log file analyzer\n• Simple text-based database'
            ],
            advanced: [
                '**Complex Algorithms**\n• Implement quicksort or mergesort\n• Graph traversal (BFS/DFS)\n• Dynamic programming problems',
                '**System Design**\n• Build a simple web scraper\n• Create a basic REST API\n• Design a caching system',
                '**Advanced Patterns**\n• Implement design patterns\n• Multi-threading examples\n• Memory optimization challenges',
                '**Real-world Projects**\n• Build a simple compiler/interpreter\n• Create a basic game engine\n• Develop a mini database system'
            ]
        };

        const practiceProblems = problems[difficulty] || problems.beginner;

        const embed = new Discord.EmbedBuilder()
            .setColor(0x008080)
            .setTitle(`💪 ${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Practice Problems`)
            .setDescription(`Here are some coding challenges to improve your skills:`)
            .addFields(
                practiceProblems.map((problem, index) => ({
                    name: `🎯 Challenge Set ${index + 1}`,
                    value: problem,
                    inline: false
                }))
            )
            .addFields({
                name: '📚 Practice Resources',
                value: '• **LeetCode**: Algorithm practice\n• **HackerRank**: Coding challenges\n• **Codewars**: Kata challenges\n• **Project Euler**: Math problems\n• **Exercism**: Language-specific exercises',
                inline: false
            })
            .addFields({
                name: '💡 Tips for Practice',
                value: '• Start with easier problems and work up\n• Focus on understanding, not just solving\n• Practice regularly (even 15 minutes daily)\n• Review and optimize your solutions\n• Don\'t look at solutions immediately',
                inline: false
            })
            .setFooter({ text: ee.footertext, iconURL: ee.footericon });

        interaction.reply({ embeds: [embed] });
    }
};
