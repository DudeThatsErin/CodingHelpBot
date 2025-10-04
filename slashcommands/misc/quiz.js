const Discord = require('discord.js');
const ee = require('../../config/embed.json');

module.exports = {
    name: 'quiz',
    description: 'Take a quiz to test your knowledge on specific topics.',
    options: [
        {
            name: 'topic',
            description: 'Choose a topic to quiz yourself on',
            required: true,
            type: 3,
            choices: [
                { name: 'JavaScript Basics', value: 'javascript-basics' },
                { name: 'Python Fundamentals', value: 'python-fundamentals' },
                { name: 'Data Structures', value: 'data-structures' },
                { name: 'Web Development', value: 'web-development' },
                { name: 'Algorithms', value: 'algorithms' },
                { name: 'Database Concepts', value: 'database-concepts' },
                { name: 'Git & Version Control', value: 'git-version-control' },
                { name: 'Programming Logic', value: 'programming-logic' }
            ]
        }
    ],
    usage: '/quiz <topic>',
    execute(interaction) {
        const topic = interaction.options.getString('topic');
        
        const quizzes = {
            'javascript-basics': {
                title: '⚡ JavaScript Basics Quiz',
                questions: [
                    '**Q1:** What does `===` do in JavaScript?\na) Assignment\nb) Loose equality\nc) Strict equality\nd) Not equal',
                    '**Q2:** Which method adds an element to the end of an array?\na) push()\nb) pop()\nc) shift()\nd) unshift()',
                    '**Q3:** What is the result of `typeof null`?\na) "null"\nb) "undefined"\nc) "object"\nd) "boolean"',
                    '**Q4:** How do you declare a constant in JavaScript?\na) var\nb) let\nc) const\nd) final'
                ],
                answers: 'Answers: 1-c, 2-a, 3-c, 4-c'
            },
            'python-fundamentals': {
                title: '🐍 Python Fundamentals Quiz',
                questions: [
                    '**Q1:** Which of these is NOT a Python data type?\na) list\nb) tuple\nc) array\nd) dict',
                    '**Q2:** What does `len()` function return?\na) Last element\nb) First element\nc) Number of elements\nd) Type of object',
                    '**Q3:** How do you start a comment in Python?\na) //\nb) #\nc) /*\nd) --',
                    '**Q4:** What is the correct way to create a function?\na) function myFunc()\nb) def myFunc():\nc) create myFunc()\nd) func myFunc()'
                ],
                answers: 'Answers: 1-c, 2-c, 3-b, 4-b'
            },
            'data-structures': {
                title: '📊 Data Structures Quiz',
                questions: [
                    '**Q1:** What is the time complexity of accessing an element in an array by index?\na) O(1)\nb) O(n)\nc) O(log n)\nd) O(n²)',
                    '**Q2:** Which data structure follows LIFO principle?\na) Queue\nb) Stack\nc) Array\nd) Linked List',
                    '**Q3:** What is the main advantage of a linked list over an array?\na) Faster access\nb) Less memory usage\nc) Dynamic size\nd) Better cache performance',
                    '**Q4:** In a binary search tree, what is true about the left child?\na) Always smaller than parent\nb) Always larger than parent\nc) Can be any value\nd) Must be negative'
                ],
                answers: 'Answers: 1-a, 2-b, 3-c, 4-a'
            },
            'web-development': {
                title: '🌐 Web Development Quiz',
                questions: [
                    '**Q1:** What does HTML stand for?\na) High Tech Modern Language\nb) HyperText Markup Language\nc) Home Tool Markup Language\nd) Hyperlink and Text Markup Language',
                    '**Q2:** Which CSS property controls text size?\na) font-weight\nb) font-size\nc) text-size\nd) font-style',
                    '**Q3:** What is the purpose of the `<head>` tag?\na) Main content\nb) Navigation\nc) Metadata\nd) Footer',
                    '**Q4:** Which HTTP method is used to retrieve data?\na) POST\nb) PUT\nc) DELETE\nd) GET'
                ],
                answers: 'Answers: 1-b, 2-b, 3-c, 4-d'
            },
            'algorithms': {
                title: '⚙️ Algorithms Quiz',
                questions: [
                    '**Q1:** What is the time complexity of binary search?\na) O(1)\nb) O(n)\nc) O(log n)\nd) O(n²)',
                    '**Q2:** Which sorting algorithm has the best average case performance?\na) Bubble Sort\nb) Selection Sort\nc) Quick Sort\nd) Insertion Sort',
                    '**Q3:** What does "Big O" notation describe?\na) Best case performance\nb) Worst case performance\nc) Average case performance\nd) Space complexity only',
                    '**Q4:** Which algorithm is used for finding shortest paths?\na) DFS\nb) BFS\nc) Dijkstra\nd) Binary Search'
                ],
                answers: 'Answers: 1-c, 2-c, 3-b, 4-c'
            },
            'database-concepts': {
                title: '🗄️ Database Concepts Quiz',
                questions: [
                    '**Q1:** What does SQL stand for?\na) Structured Query Language\nb) Simple Query Language\nc) Standard Query Language\nd) System Query Language',
                    '**Q2:** Which command is used to retrieve data?\na) INSERT\nb) UPDATE\nc) SELECT\nd) DELETE',
                    '**Q3:** What is a primary key?\na) First column\nb) Unique identifier\nc) Foreign reference\nd) Index column',
                    '**Q4:** What does ACID stand for in databases?\na) Atomicity, Consistency, Isolation, Durability\nb) Access, Control, Integration, Data\nc) Automatic, Consistent, Integrated, Dynamic\nd) Advanced, Controlled, Isolated, Distributed'
                ],
                answers: 'Answers: 1-a, 2-c, 3-b, 4-a'
            },
            'git-version-control': {
                title: '📝 Git & Version Control Quiz',
                questions: [
                    '**Q1:** What command creates a new Git repository?\na) git create\nb) git init\nc) git new\nd) git start',
                    '**Q2:** What does `git add .` do?\na) Adds all files to staging\nb) Adds current directory\nc) Adds new files only\nd) Adds modified files only',
                    '**Q3:** How do you create a new branch?\na) git branch new-branch\nb) git create new-branch\nc) git checkout new-branch\nd) git new new-branch',
                    '**Q4:** What is the purpose of `git merge`?\na) Delete branches\nb) Combine branches\nc) Create branches\nd) Switch branches'
                ],
                answers: 'Answers: 1-b, 2-a, 3-a, 4-b'
            },
            'programming-logic': {
                title: '🧠 Programming Logic Quiz',
                questions: [
                    '**Q1:** What will this loop do: `for i in range(5)`?\na) Run 4 times\nb) Run 5 times\nc) Run 6 times\nd) Run infinitely',
                    '**Q2:** What is the result of `5 % 2`?\na) 2\nb) 2.5\nc) 1\nd) 0',
                    '**Q3:** Which operator checks if two values are NOT equal?\na) !=\nb) ==\nc) <>\nd) !==',
                    '**Q4:** What does the `break` statement do in a loop?\na) Pauses the loop\nb) Exits the loop\nc) Restarts the loop\nd) Skips one iteration'
                ],
                answers: 'Answers: 1-b, 2-c, 3-a, 4-b'
            }
        };

        const quiz = quizzes[topic];
        if (!quiz) {
            return interaction.reply({ content: 'Quiz topic not found!', ephemeral: true });
        }

        const embed = new Discord.EmbedBuilder()
            .setColor(0x008080)
            .setTitle(quiz.title)
            .setDescription('Test your knowledge with these questions:')
            .addFields(
                quiz.questions.map((question, index) => ({
                    name: `Question ${index + 1}`,
                    value: question,
                    inline: false
                }))
            )
            .addFields({
                name: '📝 How to Take the Quiz',
                value: '• Read each question carefully\n• Think about your answer\n• Check the answers below when ready\n• Review topics you got wrong',
                inline: false
            })
            .addFields({
                name: '✅ Answers',
                value: quiz.answers,
                inline: false
            })
            .setFooter({ text: ee.footertext, iconURL: ee.footericon });

        interaction.reply({ embeds: [embed] });
    }
};
