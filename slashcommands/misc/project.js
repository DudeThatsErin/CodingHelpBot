const Discord = require('discord.js');
const ee = require('../../config/embed.json');

module.exports = {
    name: 'project',
    description: 'Get project ideas with step-by-step guidance.',
    options: [
        {
            name: 'type',
            description: 'Type of project you want to build',
            required: true,
            type: 3,
            choices: [
                { name: 'Web App', value: 'web-app' },
                { name: 'Game', value: 'game' },
                { name: 'Mobile App', value: 'mobile-app' },
                { name: 'API', value: 'api' },
                { name: 'Desktop App', value: 'desktop-app' },
                { name: 'Data Science', value: 'data-science' },
                { name: 'Automation', value: 'automation' },
                { name: 'CLI Tool', value: 'cli-tool' }
            ]
        },
        {
            name: 'language',
            description: 'Preferred programming language',
            required: false,
            type: 3,
            choices: [
                { name: 'JavaScript', value: 'javascript' },
                { name: 'Python', value: 'python' },
                { name: 'Java', value: 'java' },
                { name: 'C#', value: 'csharp' },
                { name: 'Any', value: 'any' }
            ]
        }
    ],
    usage: '/project <type> [language]',
    execute(interaction) {
        const type = interaction.options.getString('type');
        const language = interaction.options.getString('language') || 'any';

        const projects = {
            'web-app': {
                title: '🌐 Web Application Projects',
                projects: [
                    '**Personal Portfolio Website**\n• Showcase your projects and skills\n• Responsive design with HTML/CSS/JS\n• Contact form and project gallery',
                    '**Todo List App**\n• Add, edit, delete tasks\n• Local storage or database\n• Categories and due dates',
                    '**Weather Dashboard**\n• Fetch data from weather API\n• Location-based forecasts\n• Interactive charts and maps',
                    '**Recipe Finder**\n• Search recipes by ingredients\n• Save favorites\n• Meal planning features'
                ]
            },
            'game': {
                title: '🎮 Game Development Projects',
                projects: [
                    '**Snake Game**\n• Classic arcade-style game\n• Score tracking\n• Increasing difficulty levels',
                    '**Tic-Tac-Toe**\n• Two-player or vs AI\n• Win detection logic\n• Game state management',
                    '**Puzzle Game**\n• Sliding puzzle or match-3\n• Level progression\n• Animation and sound effects',
                    '**Text Adventure**\n• Story-driven gameplay\n• Choice-based narrative\n• Inventory system'
                ]
            },
            'mobile-app': {
                title: '📱 Mobile App Projects',
                projects: [
                    '**Expense Tracker**\n• Track income and expenses\n• Category-based organization\n• Charts and reports',
                    '**Habit Tracker**\n• Daily habit monitoring\n• Streak counting\n• Progress visualization',
                    '**Local Business Finder**\n• GPS-based search\n• Reviews and ratings\n• Map integration',
                    '**Fitness Logger**\n• Workout tracking\n• Progress photos\n• Goal setting'
                ]
            },
            'api': {
                title: '🔌 API Projects',
                projects: [
                    '**RESTful Blog API**\n• CRUD operations for posts\n• User authentication\n• Comment system',
                    '**URL Shortener**\n• Generate short URLs\n• Click tracking\n• Custom aliases',
                    '**File Upload Service**\n• Secure file uploads\n• Image processing\n• Storage management',
                    '**Chat API**\n• Real-time messaging\n• User rooms/channels\n• Message history'
                ]
            },
            'desktop-app': {
                title: '🖥️ Desktop Application Projects',
                projects: [
                    '**Text Editor**\n• File operations\n• Syntax highlighting\n• Find and replace',
                    '**Image Viewer**\n• Browse image folders\n• Basic editing tools\n• Slideshow mode',
                    '**System Monitor**\n• CPU and memory usage\n• Process management\n• Performance graphs',
                    '**Password Manager**\n• Encrypted storage\n• Password generation\n• Auto-fill features'
                ]
            },
            'data-science': {
                title: '📊 Data Science Projects',
                projects: [
                    '**Sales Data Analysis**\n• Import CSV/Excel data\n• Trend analysis\n• Interactive visualizations',
                    '**Movie Recommendation System**\n• Collaborative filtering\n• Content-based recommendations\n• User rating predictions',
                    '**Stock Price Predictor**\n• Historical data analysis\n• Machine learning models\n• Prediction accuracy metrics',
                    '**Social Media Sentiment Analysis**\n• Text preprocessing\n• Sentiment classification\n• Trend visualization'
                ]
            },
            'automation': {
                title: '🤖 Automation Projects',
                projects: [
                    '**Web Scraper**\n• Extract data from websites\n• Handle pagination\n• Export to CSV/JSON',
                    '**Email Automation**\n• Scheduled email sending\n• Template management\n• Recipient lists',
                    '**File Organizer**\n• Sort files by type/date\n• Duplicate detection\n• Batch renaming',
                    '**Social Media Bot**\n• Automated posting\n• Content scheduling\n• Engagement tracking'
                ]
            },
            'cli-tool': {
                title: '⌨️ Command Line Tool Projects',
                projects: [
                    '**Task Manager CLI**\n• Add/remove tasks\n• Priority levels\n• Due date reminders',
                    '**File Backup Tool**\n• Incremental backups\n• Compression options\n• Restore functionality',
                    '**Log Analyzer**\n• Parse log files\n• Error detection\n• Statistics generation',
                    '**Code Generator**\n• Template-based generation\n• Custom configurations\n• Multiple language support'
                ]
            }
        };

        const projectData = projects[type];
        if (!projectData) {
            return interaction.reply({ content: 'Project type not found!', ephemeral: true });
        }

        const embed = new Discord.EmbedBuilder()
            .setColor(0x008080)
            .setTitle(projectData.title)
            .setDescription('Here are some project ideas to build your skills:')
            .addFields(
                projectData.projects.map((project, index) => ({
                    name: `💡 Project ${index + 1}`,
                    value: project,
                    inline: false
                }))
            )
            .addFields({
                name: '🚀 Getting Started Tips',
                value: '• Start with a simple version (MVP)\n• Break the project into small tasks\n• Set up version control (Git)\n• Plan your database/data structure\n• Focus on core functionality first',
                inline: false
            })
            .addFields({
                name: '📈 Level Up Your Project',
                value: '• Add user authentication\n• Implement responsive design\n• Add testing and documentation\n• Deploy to the cloud\n• Gather user feedback',
                inline: false
            })
            .setFooter({ text: ee.footertext, iconURL: ee.footericon });

        interaction.reply({ embeds: [embed] });
    }
};
