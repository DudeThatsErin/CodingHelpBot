const Discord = require('discord.js');
const ee = require('../../config/embed.json');

module.exports = {
    name: 'concept',
    description: 'Learn about programming concepts and terminology.',
    options: [
        {
            name: 'topic',
            description: 'The programming concept you want to learn about',
            required: true,
            type: 3,
            choices: [
                { name: 'Recursion', value: 'recursion' },
                { name: 'Object-Oriented Programming', value: 'oop' },
                { name: 'Algorithms', value: 'algorithms' },
                { name: 'Data Structures', value: 'data-structures' },
                { name: 'APIs', value: 'apis' },
                { name: 'Databases', value: 'databases' },
                { name: 'Version Control', value: 'version-control' },
                { name: 'Testing', value: 'testing' }
            ]
        }
    ],
    usage: '/concept <topic>',
    execute(interaction) {
        const topic = interaction.options.getString('topic');
        
        const concepts = {
            recursion: {
                title: '🔄 Recursion',
                definition: 'A programming technique where a function calls itself to solve smaller instances of the same problem.',
                explanation: 'Think of recursion like Russian nesting dolls - each doll contains a smaller version of itself. In programming, we break down a big problem into smaller, similar problems.',
                example: '```python\ndef factorial(n):\n    if n <= 1:  # Base case\n        return 1\n    return n * factorial(n-1)  # Recursive call\n```',
                keyPoints: ['Must have a base case to stop', 'Each call should get closer to the base case', 'Can be memory intensive', 'Often more elegant than iterative solutions']
            },
            oop: {
                title: '🏗️ Object-Oriented Programming',
                definition: 'A programming paradigm based on the concept of objects, which contain data (attributes) and code (methods).',
                explanation: 'OOP is like organizing code into blueprints (classes) that can create objects. Think of a car blueprint - you can make many cars from one blueprint.',
                example: '```python\nclass Car:\n    def __init__(self, brand, model):\n        self.brand = brand\n        self.model = model\n    \n    def start_engine(self):\n        return f"{self.brand} {self.model} engine started!"\n```',
                keyPoints: ['Encapsulation: Bundle data and methods', 'Inheritance: Create new classes from existing ones', 'Polymorphism: Same interface, different implementations', 'Abstraction: Hide complex implementation details']
            },
            algorithms: {
                title: '⚙️ Algorithms',
                definition: 'Step-by-step procedures or formulas for solving problems or completing tasks.',
                explanation: 'An algorithm is like a recipe - it\'s a set of instructions that, when followed correctly, will solve a problem or accomplish a task.',
                example: '```python\n# Binary Search Algorithm\ndef binary_search(arr, target):\n    left, right = 0, len(arr) - 1\n    while left <= right:\n        mid = (left + right) // 2\n        if arr[mid] == target:\n            return mid\n        elif arr[mid] < target:\n            left = mid + 1\n        else:\n            right = mid - 1\n    return -1\n```',
                keyPoints: ['Must be precise and unambiguous', 'Should terminate in finite steps', 'Efficiency matters (time and space complexity)', 'Can be implemented in any programming language']
            },
            'data-structures': {
                title: '📊 Data Structures',
                definition: 'Ways of organizing and storing data in a computer so that it can be accessed and modified efficiently.',
                explanation: 'Data structures are like different types of containers - arrays are like egg cartons (fixed slots), linked lists are like chains, and trees are like family trees.',
                example: '```python\n# Different data structures\narray = [1, 2, 3, 4, 5]  # List/Array\nstack = []  # LIFO - Last In, First Out\nqueue = []  # FIFO - First In, First Out\nhash_map = {"key": "value"}  # Dictionary/HashMap\n```',
                keyPoints: ['Arrays: Fast access by index', 'Linked Lists: Dynamic size, efficient insertion', 'Stacks: LIFO operations', 'Queues: FIFO operations', 'Trees: Hierarchical data', 'Hash Tables: Fast key-value lookup']
            },
            apis: {
                title: '🔌 APIs (Application Programming Interfaces)',
                definition: 'Sets of protocols and tools that allow different software applications to communicate with each other.',
                explanation: 'APIs are like waiters in a restaurant - they take your order (request), bring it to the kitchen (server), and return with your food (response).',
                example: '```javascript\n// Making an API request\nfetch("https://api.example.com/users")\n  .then(response => response.json())\n  .then(data => console.log(data))\n  .catch(error => console.error(error));\n```',
                keyPoints: ['REST: Common web API architecture', 'HTTP methods: GET, POST, PUT, DELETE', 'JSON: Common data format', 'Authentication often required', 'Rate limiting may apply']
            },
            databases: {
                title: '🗄️ Databases',
                definition: 'Organized collections of structured information, or data, typically stored electronically in a computer system.',
                explanation: 'Databases are like digital filing cabinets that can store, organize, and retrieve large amounts of information quickly and efficiently.',
                example: '```sql\n-- SQL Database Query\nSELECT name, email FROM users \nWHERE age > 18 \nORDER BY name;\n```',
                keyPoints: ['SQL: Relational databases (MySQL, PostgreSQL)', 'NoSQL: Document, key-value, graph databases', 'CRUD operations: Create, Read, Update, Delete', 'Indexing improves query performance', 'Normalization reduces data redundancy']
            },
            'version-control': {
                title: '📝 Version Control',
                definition: 'A system that records changes to files over time so you can recall specific versions later.',
                explanation: 'Version control is like having a time machine for your code - you can see what changed, when it changed, and go back to any previous version.',
                example: '```bash\n# Basic Git commands\ngit add .\ngit commit -m "Add new feature"\ngit push origin main\ngit pull origin main\n```',
                keyPoints: ['Git: Most popular version control system', 'Repositories: Store project history', 'Commits: Snapshots of changes', 'Branches: Parallel development lines', 'Merging: Combining different branches']
            },
            testing: {
                title: '🧪 Testing',
                definition: 'The process of evaluating and verifying that a software application or system works as expected.',
                explanation: 'Testing is like proofreading your essay - you check for errors, make sure everything works correctly, and verify it meets requirements.',
                example: '```python\n# Unit test example\ndef test_add_function():\n    assert add(2, 3) == 5\n    assert add(-1, 1) == 0\n    assert add(0, 0) == 0\n```',
                keyPoints: ['Unit tests: Test individual functions', 'Integration tests: Test component interactions', 'End-to-end tests: Test complete workflows', 'Test-driven development: Write tests first', 'Automated testing saves time']
            }
        };

        const concept = concepts[topic];
        if (!concept) {
            return interaction.reply({ content: 'Concept not found!', ephemeral: true });
        }

        const embed = new Discord.EmbedBuilder()
            .setColor(0x008080)
            .setTitle(concept.title)
            .setDescription(`**Definition:** ${concept.definition}`)
            .addFields(
                {
                    name: '💡 Simple Explanation',
                    value: concept.explanation,
                    inline: false
                },
                {
                    name: '📝 Example',
                    value: concept.example,
                    inline: false
                },
                {
                    name: '🔑 Key Points',
                    value: concept.keyPoints.map(point => `• ${point}`).join('\n'),
                    inline: false
                }
            )
            .setFooter({ text: ee.footertext, iconURL: ee.footericon });

        interaction.reply({ embeds: [embed] });
    }
};
