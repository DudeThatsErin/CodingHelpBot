const { EmbedBuilder } = require('discord.js');
const { enableSystem } = require('../../database-init.js');

module.exports = {
    name: 'enable-challenge-system',
    description: 'Enables the challenge system and creates necessary database tables',
    usage: '/enable-challenge-system',
    modOnly: 1,
    options: [
        {
            name: 'announcements-channel',
            description: 'Channel where challenges will be announced',
            type: 7,
            required: true
        },
        {
            name: 'leaderboard-channel',
            description: 'Channel where challenge leaderboards will be posted',
            type: 7,
            required: false
        },
        {
            name: 'prize1',
            description: 'First place prize',
            type: 3,
            required: false
        },
        {
            name: 'prize2', 
            description: 'Second place prize',
            type: 3,
            required: false
        },
        {
            name: 'prize3',
            description: 'Third place prize', 
            type: 3,
            required: false
        }
    ],
    async execute(interaction) {
        const guildId = interaction.guild.id;
        const announcementsChannel = interaction.options.getChannel('announcements-channel');
        const leaderboardChannel = interaction.options.getChannel('leaderboard-channel') || announcementsChannel;
        const prize1 = interaction.options.getString('prize1') || 'TBD';
        const prize2 = interaction.options.getString('prize2') || 'TBD';
        const prize3 = interaction.options.getString('prize3') || 'TBD';

        try {
            // Enable the challenge system
            const success = await enableSystem(guildId, 'challenges');
            
            if (success) {
                // Initialize the Challenge table with guild settings
                const connection = require('../../database.js');
                await connection.run(
                    `INSERT OR REPLACE INTO Challenge (guildId, channelD, leaderboardChannelId, prize1, prize2, prize3, challengeNo) VALUES (?, ?, ?, ?, ?, ?, 0)`,
                    [guildId, announcementsChannel.id, leaderboardChannel.id, prize1, prize2, prize3]
                );

                const embed = new EmbedBuilder()
                    .setColor(0x00ff00)
                    .setTitle('✅ Challenge System Enabled')
                    .setDescription('The challenge system has been successfully enabled for this server!')
                    .addFields(
                        { name: 'Announcements Channel', value: `${announcementsChannel}`, inline: true },
                        { name: 'Leaderboard Channel', value: `${leaderboardChannel}`, inline: true },
                        { name: '🥇 First Place Prize', value: prize1, inline: true },
                        { name: '🥈 Second Place Prize', value: prize2, inline: true },
                        { name: '🥉 Third Place Prize', value: prize3, inline: true }
                    )
                    .setFooter({ text: 'You can now use challenge system commands!' })
                    .setTimestamp();

                await interaction.reply({ embeds: [embed] });
            } else {
                throw new Error('Failed to enable challenge system');
            }
        } catch (error) {
            console.error('Error enabling challenge system:', error);
            
            const errorEmbed = new EmbedBuilder()
                .setColor(0xff0000)
                .setTitle('❌ Error')
                .setDescription('Failed to enable the challenge system. Please try again or contact an administrator.')
                .setTimestamp();

            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
    }
};
