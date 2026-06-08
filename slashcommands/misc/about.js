const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require('discord.js');
const { COLORS } = require('../../logging/logger');

module.exports = {
    name: 'about',
    description: 'Learn about the r/CodingHelp bot',
    usage: '/about',
    example: '/about',
    async execute(interaction) {
        // Calculate uptime
        const uptimeDays = Math.floor(interaction.client.uptime / 86400000);
        const uptimeHours = Math.floor(interaction.client.uptime / 3600000) % 24;
        
        // Create about embed using standard Discord.js
        const aboutEmbed = new EmbedBuilder()
            .setColor(COLORS.teal)
            .setTitle('About r/CodingHelp Bot')
            .setThumbnail(interaction.client.user.displayAvatarURL())
            .setDescription('I am the official bot of the r/CodingHelp Discord server and subreddit community!')
            .addFields(
                {
                    name: '🎯 Purpose',
                    value: 'Help developers learn, grow, and connect with the coding community',
                    inline: false
                },
                {
                    name: '🌟 Features',
                    value: '• Welcome new members\n• Provide coding resources\n• Share server rules\n• Community management tools',
                    inline: false
                },
                {
                    name: '📊 Stats',
                    value: `• **Servers**: ${interaction.client.guilds.cache.size}\n• **Users**: ${interaction.client.users.cache.size}\n• **Uptime**: ${uptimeDays}d ${uptimeHours}h`,
                    inline: true
                }
            )
            .setFooter({ 
                text: 'Created by the r/CodingHelp team', 
                iconURL: interaction.guild?.iconURL() 
            })
            .setTimestamp();

        // Create buttons for links
        const linksRow = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setLabel('Subreddit')
                    .setStyle(ButtonStyle.Link)
                    .setURL('https://reddit.com/r/CodingHelp')
                    .setEmoji('🤖'),
                new ButtonBuilder()
                    .setLabel('Wiki')
                    .setStyle(ButtonStyle.Link)
                    .setURL('https://coding-help.vercel.app/')
                    .setEmoji('📖'),
                new ButtonBuilder()
                    .setLabel('Invite Friends')
                    .setStyle(ButtonStyle.Link)
                    .setURL('https://discord.gg/geQEUBm')
                    .setEmoji('🔗')
            );

        await interaction.reply({ 
            embeds: [aboutEmbed], 
            components: [linksRow], 
            flags: MessageFlags.Ephemeral 
        });
    }
};
