const Discord = require('discord.js');
const ee = require('../../config/embed.json');

module.exports = {
    name: 'format',
    description: 'Format and beautify your code according to best practices.',
    options: [
        {
            name: 'code',
            description: 'The code you want to format (use code blocks)',
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
                { name: 'HTML', value: 'html' },
                { name: 'CSS', value: 'css' }
            ]
        }
    ],
    usage: '/format <code> [language]',
    execute(interaction) {
        const code = interaction.options.getString('code');
        const language = interaction.options.getString('language') || 'general';

        const formattingGuidelines = {
            python: [
                '• Use 4 spaces for indentation (not tabs)',
                '• Follow PEP 8 style guide',
                '• Use snake_case for variables and functions',
                '• Use PascalCase for class names',
                '• Add spaces around operators: `x = 1 + 2`',
                '• Use meaningful variable names',
                '• Keep lines under 79 characters',
                '• Add docstrings to functions and classes'
            ],
            javascript: [
                '• Use 2 or 4 spaces consistently',
                '• Use camelCase for variables and functions',
                '• Use PascalCase for constructors/classes',
                '• Add semicolons at end of statements',
                '• Use `const` and `let` instead of `var`',
                '• Add spaces around operators',
                '• Use meaningful variable names',
                '• Format objects and arrays nicely'
            ],
            java: [
                '• Use 4 spaces for indentation',
                '• Use camelCase for variables and methods',
                '• Use PascalCase for class names',
                '• Add spaces around operators',
                '• Place opening braces on same line',
                '• Use meaningful names',
                '• Follow Oracle Java conventions',
                '• Add proper JavaDoc comments'
            ],
            cpp: [
                '• Use consistent indentation (2-4 spaces)',
                '• Use snake_case or camelCase consistently',
                '• Add spaces around operators',
                '• Place braces consistently',
                '• Use meaningful variable names',
                '• Separate logical sections with blank lines',
                '• Add comments for complex logic',
                '• Follow a consistent style guide'
            ],
            html: [
                '• Use 2 spaces for indentation',
                '• Use lowercase for tag names',
                '• Quote all attribute values',
                '• Close all tags properly',
                '• Use semantic HTML elements',
                '• Indent nested elements',
                '• Add alt text to images',
                '• Use proper document structure'
            ],
            css: [
                '• Use 2 spaces for indentation',
                '• Use lowercase for properties',
                '• Add spaces after colons',
                '• Use shorthand properties when possible',
                '• Group related properties',
                '• Use meaningful class names',
                '• Add comments for complex styles',
                '• Organize styles logically'
            ],
            general: [
                '• Use consistent indentation',
                '• Add spaces around operators',
                '• Use meaningful variable names',
                '• Keep lines at reasonable length',
                '• Add comments for complex logic',
                '• Group related code together',
                '• Remove unnecessary whitespace',
                '• Follow language conventions'
            ]
        };

        const guidelines = formattingGuidelines[language] || formattingGuidelines.general;

        const embed = new Discord.EmbedBuilder()
            .setColor(0x008080)
            .setTitle('✨ Code Formatting Assistant')
            .setDescription('Here are formatting guidelines for your code:')
            .addFields(
                {
                    name: '📝 Your Code',
                    value: code.length > 800 ? code.substring(0, 800) + '...' : code,
                    inline: false
                },
                {
                    name: '📐 Formatting Guidelines',
                    value: guidelines.join('\n'),
                    inline: false
                },
                {
                    name: '🛠️ Formatting Tools',
                    value: '• **Python**: Black, autopep8, yapf\n• **JavaScript**: Prettier, ESLint\n• **Java**: Google Java Format, Eclipse formatter\n• **C++**: clang-format\n• **HTML/CSS**: Prettier, HTML Tidy\n• **Multi-language**: EditorConfig',
                    inline: false
                },
                {
                    name: '💡 Pro Tips',
                    value: '• Set up auto-formatting in your IDE\n• Use linters to catch style issues\n• Be consistent within your project\n• Follow team/project style guides\n• Format before committing code',
                    inline: false
                }
            )
            .setFooter({ text: ee.footertext, iconURL: ee.footericon });

        interaction.reply({ embeds: [embed] });
    }
};
