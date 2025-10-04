const Discord = require('discord.js');
const ee = require('../../config/embed.json');

module.exports = {
    name: 'syntax',
    description: 'Get syntax examples for specific language features.',
    options: [
        {
            name: 'language',
            description: 'Programming language',
            required: true,
            type: 3,
            choices: [
                { name: 'Python', value: 'python' },
                { name: 'JavaScript', value: 'javascript' },
                { name: 'Java', value: 'java' },
                { name: 'C++', value: 'cpp' },
                { name: 'C#', value: 'csharp' },
                { name: 'Go', value: 'go' },
                { name: 'Rust', value: 'rust' },
                { name: 'PHP', value: 'php' }
            ]
        },
        {
            name: 'feature',
            description: 'Language feature to show syntax for',
            required: false,
            type: 3,
            choices: [
                { name: 'Loops', value: 'loops' },
                { name: 'Functions', value: 'functions' },
                { name: 'Classes', value: 'classes' },
                { name: 'Arrays/Lists', value: 'arrays' },
                { name: 'Conditionals', value: 'conditionals' }
            ]
        }
    ],
    usage: '/syntax <language> [feature]',
    execute(interaction) {
        const language = interaction.options.getString('language');
        const feature = interaction.options.getString('feature') || 'general';

        const syntaxExamples = {
            python: {
                loops: '```python\n# For loop\nfor i in range(5):\n    print(i)\n\n# While loop\ncount = 0\nwhile count < 5:\n    print(count)\n    count += 1\n\n# For each\nfruits = ["apple", "banana"]\nfor fruit in fruits:\n    print(fruit)\n```',
                functions: '```python\n# Basic function\ndef greet(name):\n    return f"Hello, {name}!"\n\n# Function with default parameter\ndef power(base, exp=2):\n    return base ** exp\n\n# Lambda function\nsquare = lambda x: x ** 2\n```',
                classes: '```python\nclass Person:\n    def __init__(self, name, age):\n        self.name = name\n        self.age = age\n    \n    def introduce(self):\n        return f"Hi, I\'m {self.name}"\n\n# Usage\nperson = Person("Alice", 30)\nprint(person.introduce())\n```',
                arrays: '```python\n# List creation\nnumbers = [1, 2, 3, 4, 5]\nfruits = ["apple", "banana", "cherry"]\n\n# List operations\nnumbers.append(6)\nnumbers.remove(3)\nprint(len(numbers))\nprint(numbers[0])  # First element\n```',
                conditionals: '```python\n# If statement\nage = 18\nif age >= 18:\n    print("Adult")\nelif age >= 13:\n    print("Teenager")\nelse:\n    print("Child")\n\n# Ternary operator\nstatus = "adult" if age >= 18 else "minor"\n```'
            },
            javascript: {
                loops: '```javascript\n// For loop\nfor (let i = 0; i < 5; i++) {\n    console.log(i);\n}\n\n// While loop\nlet count = 0;\nwhile (count < 5) {\n    console.log(count);\n    count++;\n}\n\n// For each\nconst fruits = ["apple", "banana"];\nfruits.forEach(fruit => console.log(fruit));\n```',
                functions: '```javascript\n// Function declaration\nfunction greet(name) {\n    return `Hello, ${name}!`;\n}\n\n// Arrow function\nconst square = (x) => x * x;\n\n// Function with default parameter\nfunction power(base, exp = 2) {\n    return Math.pow(base, exp);\n}\n```',
                classes: '```javascript\nclass Person {\n    constructor(name, age) {\n        this.name = name;\n        this.age = age;\n    }\n    \n    introduce() {\n        return `Hi, I\'m ${this.name}`;\n    }\n}\n\n// Usage\nconst person = new Person("Alice", 30);\nconsole.log(person.introduce());\n```',
                arrays: '```javascript\n// Array creation\nconst numbers = [1, 2, 3, 4, 5];\nconst fruits = ["apple", "banana", "cherry"];\n\n// Array operations\nnumbers.push(6);\nnumbers.pop();\nconsole.log(numbers.length);\nconsole.log(numbers[0]);  // First element\n```',
                conditionals: '```javascript\n// If statement\nconst age = 18;\nif (age >= 18) {\n    console.log("Adult");\n} else if (age >= 13) {\n    console.log("Teenager");\n} else {\n    console.log("Child");\n}\n\n// Ternary operator\nconst status = age >= 18 ? "adult" : "minor";\n```'
            },
            java: {
                loops: '```java\n// For loop\nfor (int i = 0; i < 5; i++) {\n    System.out.println(i);\n}\n\n// While loop\nint count = 0;\nwhile (count < 5) {\n    System.out.println(count);\n    count++;\n}\n\n// Enhanced for loop\nString[] fruits = {"apple", "banana"};\nfor (String fruit : fruits) {\n    System.out.println(fruit);\n}\n```',
                functions: '```java\n// Method in class\npublic class Example {\n    public static String greet(String name) {\n        return "Hello, " + name + "!";\n    }\n    \n    public static int power(int base, int exp) {\n        return (int) Math.pow(base, exp);\n    }\n}\n```',
                classes: '```java\npublic class Person {\n    private String name;\n    private int age;\n    \n    public Person(String name, int age) {\n        this.name = name;\n        this.age = age;\n    }\n    \n    public String introduce() {\n        return "Hi, I\'m " + this.name;\n    }\n}\n```',
                arrays: '```java\n// Array creation\nint[] numbers = {1, 2, 3, 4, 5};\nString[] fruits = new String[3];\nfruits[0] = "apple";\n\n// Array operations\nSystem.out.println(numbers.length);\nSystem.out.println(numbers[0]);  // First element\n```',
                conditionals: '```java\n// If statement\nint age = 18;\nif (age >= 18) {\n    System.out.println("Adult");\n} else if (age >= 13) {\n    System.out.println("Teenager");\n} else {\n    System.out.println("Child");\n}\n\n// Ternary operator\nString status = age >= 18 ? "adult" : "minor";\n```'
            }
        };

        const langSyntax = syntaxExamples[language];
        if (!langSyntax) {
            return interaction.reply({ content: 'Language not found!', ephemeral: true });
        }

        const example = langSyntax[feature] || Object.values(langSyntax)[0];

        const embed = new Discord.EmbedBuilder()
            .setColor(0x008080)
            .setTitle(`📝 ${language.charAt(0).toUpperCase() + language.slice(1)} Syntax Reference`)
            .setDescription(`Here are syntax examples for ${feature === 'general' ? 'common features' : feature}:`)
            .addFields({
                name: `💻 ${feature.charAt(0).toUpperCase() + feature.slice(1)} Examples`,
                value: example,
                inline: false
            })
            .setFooter({ text: ee.footertext, iconURL: ee.footericon });

        interaction.reply({ embeds: [embed] });
    }
};
