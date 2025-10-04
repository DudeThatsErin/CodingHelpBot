const Discord = require('discord.js');
const ee = require('../../config/embed.json');

module.exports = {
    name: 'start',
    description: 'Get a beginner\'s guide for a specific programming language.',
    options: [
        {
            name: 'language',
            description: 'The programming language you want to learn',
            required: true,
            type: 3,
            choices: [
                { name: 'Python', value: 'python' },
                { name: 'JavaScript', value: 'javascript' },
                { name: 'Java', value: 'java' },
                { name: 'C++', value: 'cpp' },
                { name: 'C#', value: 'csharp' },
                { name: 'HTML/CSS', value: 'html' },
                { name: 'Go', value: 'go' },
                { name: 'Rust', value: 'rust' }
            ]
        }
    ],
    usage: '/start <language>',
    execute(interaction) {
        const language = interaction.options.getString('language');
        
        const guides = {
            python: {
                title: '🐍 Getting Started with Python',
                description: 'Python is perfect for beginners! It has simple, readable syntax and is great for web development, data science, and automation.',
                steps: [
                    '**Install Python**: Download from python.org',
                    '**Choose an Editor**: VS Code, PyCharm, or IDLE',
                    '**Learn Basics**: Variables, loops, functions',
                    '**Practice**: Try simple projects like calculators',
                    '**Resources**: python.org/tutorial, automate the boring stuff'
                ],
                example: '```python\nprint("Hello, World!")\nname = input("What\'s your name? ")\nprint(f"Nice to meet you, {name}!")\n```'
            },
            javascript: {
                title: '⚡ Getting Started with JavaScript',
                description: 'JavaScript powers the web! Essential for front-end development and increasingly popular for back-end with Node.js.',
                steps: [
                    '**Setup**: Just a browser and text editor needed',
                    '**Learn Basics**: Variables, functions, DOM manipulation',
                    '**Practice**: Build interactive web pages',
                    '**Frameworks**: Eventually learn React, Vue, or Angular',
                    '**Resources**: MDN Web Docs, javascript.info'
                ],
                example: '```javascript\nconsole.log("Hello, World!");\nconst name = prompt("What\'s your name?");\nalert(`Nice to meet you, ${name}!`);\n```'
            },
            java: {
                title: '☕ Getting Started with Java',
                description: 'Java is robust and widely used in enterprise applications. Great for learning programming fundamentals.',
                steps: [
                    '**Install JDK**: Download from Oracle or use OpenJDK',
                    '**IDE Setup**: IntelliJ IDEA, Eclipse, or VS Code',
                    '**Learn OOP**: Classes, objects, inheritance',
                    '**Practice**: Build console applications first',
                    '**Resources**: Oracle Java tutorials, Codecademy'
                ],
                example: '```java\npublic class HelloWorld {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}\n```'
            },
            cpp: {
                title: '⚙️ Getting Started with C++',
                description: 'C++ is powerful for system programming and game development. More challenging but very rewarding.',
                steps: [
                    '**Install Compiler**: GCC, Clang, or Visual Studio',
                    '**Learn C Basics**: Pointers, memory management',
                    '**OOP Concepts**: Classes, inheritance, polymorphism',
                    '**Practice**: Start with simple console programs',
                    '**Resources**: cplusplus.com, learncpp.com'
                ],
                example: '```cpp\n#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello, World!" << endl;\n    return 0;\n}\n```'
            },
            csharp: {
                title: '🔷 Getting Started with C#',
                description: 'C# is Microsoft\'s flagship language, great for Windows applications, web development, and games with Unity.',
                steps: [
                    '**Install .NET**: Download .NET SDK from Microsoft',
                    '**IDE**: Visual Studio or VS Code with C# extension',
                    '**Learn Basics**: Syntax similar to Java and C++',
                    '**Practice**: Console apps, then Windows Forms/WPF',
                    '**Resources**: Microsoft Learn, C# documentation'
                ],
                example: '```csharp\nusing System;\n\nclass Program {\n    static void Main() {\n        Console.WriteLine("Hello, World!");\n    }\n}\n```'
            },
            html: {
                title: '🌐 Getting Started with HTML/CSS',
                description: 'HTML structures web pages, CSS styles them. Essential foundation for all web development.',
                steps: [
                    '**Setup**: Just a text editor and web browser',
                    '**HTML Basics**: Tags, elements, structure',
                    '**CSS Basics**: Selectors, properties, layout',
                    '**Practice**: Build simple web pages',
                    '**Resources**: MDN Web Docs, freeCodeCamp'
                ],
                example: '```html\n<!DOCTYPE html>\n<html>\n<head>\n    <title>My Page</title>\n</head>\n<body>\n    <h1>Hello, World!</h1>\n</body>\n</html>\n```'
            },
            go: {
                title: '🐹 Getting Started with Go',
                description: 'Go is simple, fast, and great for backend services and cloud applications.',
                steps: [
                    '**Install Go**: Download from golang.org',
                    '**Setup Workspace**: Learn about Go modules',
                    '**Learn Basics**: Simple syntax, goroutines',
                    '**Practice**: Build CLI tools and web servers',
                    '**Resources**: tour.golang.org, Go by Example'
                ],
                example: '```go\npackage main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello, World!")\n}\n```'
            },
            rust: {
                title: '🦀 Getting Started with Rust',
                description: 'Rust focuses on safety and performance. Great for systems programming without memory issues.',
                steps: [
                    '**Install Rust**: Use rustup from rustup.rs',
                    '**Learn Ownership**: Rust\'s unique memory model',
                    '**Practice**: Start with simple programs',
                    '**Cargo**: Learn Rust\'s package manager',
                    '**Resources**: The Rust Book, Rust by Example'
                ],
                example: '```rust\nfn main() {\n    println!("Hello, World!");\n}\n```'
            }
        };

        const guide = guides[language];
        if (!guide) {
            return interaction.reply({ content: 'Language not found!', ephemeral: true });
        }

        const embed = new Discord.EmbedBuilder()
            .setColor(0x008080)
            .setTitle(guide.title)
            .setDescription(guide.description)
            .addFields(
                {
                    name: '📋 Getting Started Steps',
                    value: guide.steps.join('\n'),
                    inline: false
                },
                {
                    name: '💻 Example Code',
                    value: guide.example,
                    inline: false
                }
            )
            .setFooter({ text: ee.footertext, iconURL: ee.footericon });

        interaction.reply({ embeds: [embed] });
    }
};
