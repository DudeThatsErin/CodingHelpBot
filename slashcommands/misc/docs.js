const Discord = require('discord.js');
const ee = require('../../config/embed.json');

module.exports = {
    name: 'docs',
    description: 'Get links to official documentation and resources.',
    options: [
        {
            name: 'language',
            description: 'Programming language or technology',
            required: true,
            type: 3,
            choices: [
                { name: 'Python', value: 'python' },
                { name: 'JavaScript', value: 'javascript' },
                { name: 'Java', value: 'java' },
                { name: 'C++', value: 'cpp' },
                { name: 'C#', value: 'csharp' },
                { name: 'React', value: 'react' },
                { name: 'Node.js', value: 'nodejs' },
                { name: 'HTML/CSS', value: 'html-css' }
            ]
        }
    ],
    usage: '/docs <language>',
    execute(interaction) {
        const language = interaction.options.getString('language');
        
        const documentation = {
            python: {
                title: '🐍 Python Documentation',
                official: 'https://docs.python.org/',
                resources: [
                    '[Python Tutorial](https://docs.python.org/3/tutorial/)',
                    '[Python Standard Library](https://docs.python.org/3/library/)',
                    '[PEP 8 Style Guide](https://pep8.org/)',
                    '[Real Python](https://realpython.com/)',
                    '[Python Package Index (PyPI)](https://pypi.org/)'
                ]
            },
            javascript: {
                title: '⚡ JavaScript Documentation',
                official: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript',
                resources: [
                    '[MDN JavaScript Guide](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide)',
                    '[JavaScript.info](https://javascript.info/)',
                    '[ECMAScript Specification](https://tc39.es/ecma262/)',
                    '[Can I Use](https://caniuse.com/)',
                    '[Node.js Documentation](https://nodejs.org/en/docs/)'
                ]
            },
            java: {
                title: '☕ Java Documentation',
                official: 'https://docs.oracle.com/en/java/',
                resources: [
                    '[Java SE Documentation](https://docs.oracle.com/en/java/javase/)',
                    '[Java Tutorials](https://docs.oracle.com/javase/tutorial/)',
                    '[OpenJDK](https://openjdk.java.net/)',
                    '[Spring Framework](https://spring.io/docs)',
                    '[Maven Repository](https://mvnrepository.com/)'
                ]
            },
            cpp: {
                title: '⚙️ C++ Documentation',
                official: 'https://en.cppreference.com/',
                resources: [
                    '[C++ Reference](https://en.cppreference.com/)',
                    '[ISO C++ Standard](https://isocpp.org/)',
                    '[C++ Core Guidelines](https://isocpp.github.io/CppCoreGuidelines/)',
                    '[Compiler Explorer](https://godbolt.org/)',
                    '[Boost Libraries](https://www.boost.org/)'
                ]
            },
            csharp: {
                title: '🔷 C# Documentation',
                official: 'https://docs.microsoft.com/en-us/dotnet/csharp/',
                resources: [
                    '[C# Programming Guide](https://docs.microsoft.com/en-us/dotnet/csharp/programming-guide/)',
                    '[.NET API Browser](https://docs.microsoft.com/en-us/dotnet/api/)',
                    '[C# Language Reference](https://docs.microsoft.com/en-us/dotnet/csharp/language-reference/)',
                    '[NuGet Package Manager](https://www.nuget.org/)',
                    '[ASP.NET Core](https://docs.microsoft.com/en-us/aspnet/core/)'
                ]
            },
            react: {
                title: '⚛️ React Documentation',
                official: 'https://reactjs.org/docs/',
                resources: [
                    '[React Tutorial](https://reactjs.org/tutorial/tutorial.html)',
                    '[React Hooks](https://reactjs.org/docs/hooks-intro.html)',
                    '[Create React App](https://create-react-app.dev/)',
                    '[React Router](https://reactrouter.com/)',
                    '[React DevTools](https://chrome.google.com/webstore/detail/react-developer-tools/)'
                ]
            },
            nodejs: {
                title: '🟢 Node.js Documentation',
                official: 'https://nodejs.org/en/docs/',
                resources: [
                    '[Node.js API Documentation](https://nodejs.org/api/)',
                    '[NPM Documentation](https://docs.npmjs.com/)',
                    '[Express.js](https://expressjs.com/)',
                    '[Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)',
                    '[Awesome Node.js](https://github.com/sindresorhus/awesome-nodejs)'
                ]
            },
            'html-css': {
                title: '🌐 HTML/CSS Documentation',
                official: 'https://developer.mozilla.org/en-US/docs/Web',
                resources: [
                    '[MDN HTML Reference](https://developer.mozilla.org/en-US/docs/Web/HTML)',
                    '[MDN CSS Reference](https://developer.mozilla.org/en-US/docs/Web/CSS)',
                    '[W3C HTML Specification](https://html.spec.whatwg.org/)',
                    '[CSS Tricks](https://css-tricks.com/)',
                    '[Can I Use](https://caniuse.com/)'
                ]
            }
        };

        const docs = documentation[language];
        if (!docs) {
            return interaction.reply({ content: 'Documentation not found!', ephemeral: true });
        }

        const embed = new Discord.EmbedBuilder()
            .setColor(0x008080)
            .setTitle(docs.title)
            .setDescription(`Official documentation and helpful resources:`)
            .addFields(
                {
                    name: '📚 Official Documentation',
                    value: `[Main Documentation](${docs.official})`,
                    inline: false
                },
                {
                    name: '🔗 Additional Resources',
                    value: docs.resources.join('\n'),
                    inline: false
                },
                {
                    name: '💡 Tips for Using Documentation',
                    value: '• Start with tutorials and guides\n• Use search functionality effectively\n• Check version compatibility\n• Look for code examples\n• Bookmark frequently used sections',
                    inline: false
                }
            )
            .setFooter({ text: ee.footertext, iconURL: ee.footericon });

        interaction.reply({ embeds: [embed] });
    }
};
