const Discord = require('discord.js');
const ee = require('../../config/embed.json');

module.exports = {
    name: 'roadmap',
    description: 'Get a learning roadmap for different programming fields.',
    options: [
        {
            name: 'field',
            description: 'The programming field you want to learn about',
            required: true,
            type: 3,
            choices: [
                { name: 'Web Development', value: 'web-development' },
                { name: 'Data Science', value: 'data-science' },
                { name: 'Mobile Development', value: 'mobile-development' },
                { name: 'Game Development', value: 'game-development' },
                { name: 'DevOps', value: 'devops' },
                { name: 'Machine Learning', value: 'machine-learning' },
                { name: 'Cybersecurity', value: 'cybersecurity' },
                { name: 'Backend Development', value: 'backend-development' }
            ]
        }
    ],
    usage: '/roadmap <field>',
    execute(interaction) {
        const field = interaction.options.getString('field');
        
        const roadmaps = {
            'web-development': {
                title: '🌐 Web Development Roadmap',
                description: 'Complete path to becoming a full-stack web developer',
                phases: [
                    '**Phase 1: Frontend Basics**\n• HTML5 & CSS3\n• JavaScript fundamentals\n• Responsive design\n• Git & GitHub',
                    '**Phase 2: Frontend Frameworks**\n• React, Vue, or Angular\n• State management\n• Build tools (Webpack, Vite)\n• Testing (Jest, Cypress)',
                    '**Phase 3: Backend Development**\n• Node.js or Python/Django\n• Databases (SQL & NoSQL)\n• RESTful APIs\n• Authentication & security',
                    '**Phase 4: Full-Stack & Deployment**\n• Cloud platforms (AWS, Vercel)\n• CI/CD pipelines\n• Performance optimization\n• Monitoring & analytics'
                ]
            },
            'data-science': {
                title: '📊 Data Science Roadmap',
                description: 'Path to becoming a data scientist and analyst',
                phases: [
                    '**Phase 1: Programming Foundation**\n• Python or R\n• Jupyter notebooks\n• Basic statistics\n• Data manipulation (Pandas)',
                    '**Phase 2: Data Analysis**\n• Data visualization (Matplotlib, Seaborn)\n• SQL databases\n• Statistical analysis\n• Data cleaning techniques',
                    '**Phase 3: Machine Learning**\n• Scikit-learn\n• Supervised/unsupervised learning\n• Model evaluation\n• Feature engineering',
                    '**Phase 4: Advanced Topics**\n• Deep learning (TensorFlow, PyTorch)\n• Big data tools (Spark)\n• MLOps and deployment\n• Domain specialization'
                ]
            },
            'mobile-development': {
                title: '📱 Mobile Development Roadmap',
                description: 'Path to building mobile applications',
                phases: [
                    '**Phase 1: Choose Your Path**\n• Native (Swift/Kotlin) vs Cross-platform\n• React Native or Flutter\n• Mobile UI/UX principles\n• Development environment setup',
                    '**Phase 2: Core Development**\n• App architecture patterns\n• State management\n• Navigation systems\n• Local data storage',
                    '**Phase 3: Advanced Features**\n• API integration\n• Push notifications\n• Camera & sensors\n• Performance optimization',
                    '**Phase 4: Publishing & Maintenance**\n• App store guidelines\n• Testing strategies\n• Analytics integration\n• Continuous deployment'
                ]
            },
            'game-development': {
                title: '🎮 Game Development Roadmap',
                description: 'Path to creating games and interactive experiences',
                phases: [
                    '**Phase 1: Fundamentals**\n• Choose engine (Unity, Unreal, Godot)\n• Basic programming (C#, C++, GDScript)\n• Game design principles\n• 2D/3D mathematics',
                    '**Phase 2: Core Development**\n• Physics systems\n• Animation & graphics\n• Audio implementation\n• User input handling',
                    '**Phase 3: Advanced Systems**\n• AI & pathfinding\n• Networking & multiplayer\n• Performance optimization\n• Platform-specific features',
                    '**Phase 4: Polish & Release**\n• Testing & debugging\n• Platform deployment\n• Marketing & community\n• Post-launch support'
                ]
            },
            'devops': {
                title: '⚙️ DevOps Roadmap',
                description: 'Path to becoming a DevOps engineer',
                phases: [
                    '**Phase 1: Foundation**\n• Linux administration\n• Networking basics\n• Version control (Git)\n• Scripting (Bash, Python)',
                    '**Phase 2: Infrastructure**\n• Cloud platforms (AWS, Azure, GCP)\n• Infrastructure as Code (Terraform)\n• Configuration management\n• Monitoring & logging',
                    '**Phase 3: Containerization**\n• Docker fundamentals\n• Kubernetes orchestration\n• Container security\n• Service mesh concepts',
                    '**Phase 4: CI/CD & Automation**\n• Pipeline design\n• Automated testing\n• Security integration\n• Performance monitoring'
                ]
            },
            'machine-learning': {
                title: '🤖 Machine Learning Roadmap',
                description: 'Path to mastering machine learning and AI',
                phases: [
                    '**Phase 1: Mathematical Foundation**\n• Linear algebra & calculus\n• Statistics & probability\n• Python programming\n• Data manipulation',
                    '**Phase 2: Core ML Concepts**\n• Supervised learning algorithms\n• Unsupervised learning\n• Model evaluation metrics\n• Cross-validation techniques',
                    '**Phase 3: Deep Learning**\n• Neural networks\n• TensorFlow/PyTorch\n• Computer vision\n• Natural language processing',
                    '**Phase 4: Specialization**\n• MLOps & deployment\n• Research & experimentation\n• Domain expertise\n• Ethical AI considerations'
                ]
            },
            'cybersecurity': {
                title: '🔒 Cybersecurity Roadmap',
                description: 'Path to becoming a cybersecurity professional',
                phases: [
                    '**Phase 1: Fundamentals**\n• Networking concepts\n• Operating systems (Linux/Windows)\n• Security principles\n• Risk assessment basics',
                    '**Phase 2: Technical Skills**\n• Penetration testing\n• Vulnerability assessment\n• Incident response\n• Forensics basics',
                    '**Phase 3: Specialization**\n• Choose focus area\n• Advanced certifications\n• Threat intelligence\n• Security architecture',
                    '**Phase 4: Leadership**\n• Security governance\n• Compliance frameworks\n• Team management\n• Strategic planning'
                ]
            },
            'backend-development': {
                title: '🔧 Backend Development Roadmap',
                description: 'Path to mastering server-side development',
                phases: [
                    '**Phase 1: Language & Basics**\n• Choose language (Python, Java, Node.js)\n• HTTP/HTTPS protocols\n• RESTful API design\n• Database fundamentals',
                    '**Phase 2: Frameworks & Tools**\n• Web frameworks\n• ORM/ODM libraries\n• Authentication systems\n• Caching strategies',
                    '**Phase 3: Architecture & Scale**\n• Microservices patterns\n• Message queues\n• Load balancing\n• Database optimization',
                    '**Phase 4: Production & DevOps**\n• Cloud deployment\n• Monitoring & logging\n• Security best practices\n• Performance tuning'
                ]
            }
        };

        const roadmap = roadmaps[field];
        if (!roadmap) {
            return interaction.reply({ content: 'Field not found!', ephemeral: true });
        }

        const embed = new Discord.EmbedBuilder()
            .setColor(0x008080)
            .setTitle(roadmap.title)
            .setDescription(roadmap.description)
            .addFields(
                roadmap.phases.map((phase, index) => ({
                    name: `📍 ${phase.split('**')[1].split('**')[0]}`,
                    value: phase.split('**')[2] || phase,
                    inline: false
                }))
            )
            .addFields({
                name: '💡 Pro Tips',
                value: '• Build projects at each phase\n• Join communities and forums\n• Contribute to open source\n• Keep learning continuously',
                inline: false
            })
            .setFooter({ text: ee.footertext, iconURL: ee.footericon });

        interaction.reply({ embeds: [embed] });
    }
};
