const Discord = require('discord.js');
const { systemManager, suggestionsDb } = require('../../database.js');

module.exports = {
    name: 'suggestions',
    description: 'Creates a suggestion!',
    usage: `/suggestions [suggestion here]`,
    example: `/suggestions I want pudding!`,
    options: [
        {
            name: 'message',
            description: 'What is your suggestion?',
            type: 3,
            required: true
        }
    ],
    async execute(interaction){
        // Check if suggestions system is enabled
        const isEnabled = await systemManager.isSystemEnabled(interaction.guild.id, 'suggestions');
        if (!isEnabled) {
            return await interaction.reply({
                content: '❌ The suggestions system is not enabled for this server. Please contact an administrator.',
                ephemeral: true
            });
        }

        // Get the configured suggestions channel
        const channelId = await systemManager.getSystemConfig(interaction.guild.id, 'suggestions', 'channel_id');
        if (!channelId) {
            return await interaction.reply({
                content: '❌ The suggestions system is not properly configured. Please contact an administrator.',
                ephemeral: true
            });
        }

        const channel = interaction.guild.channels.cache.get(channelId);
        if (!channel) {
            return await interaction.reply({
                content: '❌ The configured suggestions channel was not found. Please contact an administrator.',
                ephemeral: true
            });
        }
        let messageArgs = interaction.options.getString('message');
        let newStatus = 'New Suggestion';
        let author = interaction.user.id || 'default value';
        let name = interaction.user.tag;
        let avatar = interaction.user.displayAvatarURL();

        const initial = new Discord.EmbedBuilder()
        .setColor(0xFADF2E)
        .setAuthor({name: name, icon_url: avatar})
        .setDescription(messageArgs)
        .setFooter({text: '📈 This suggestion currently needs votes and feedback. If you would like to discuss it, please visit the associated thread.'});

        // Send DM notification if enabled
        const dmNotifications = await systemManager.getSystemConfig(interaction.guild.id, 'suggestions', 'dm_notifications');
        if (dmNotifications !== 'false') {
            try {
                await interaction.client.users.cache.get(author).send({content: `Hey, ${interaction.user.username}! Thanks for submitting a suggestion! Our server needs to have time to vote on this. Once some time has passed, you can check the suggestion channel to check the updated status of your suggestion! We appreciate your feedback! Happy chatting!`});
            } catch (error) {
                console.log('Could not send DM to user:', error.message);
            }
        }

        await channel.send({embeds: [initial]}).then(async (message) => {
            // Get configuration for auto-reactions and auto-threads
            const autoReactions = await systemManager.getSystemConfig(interaction.guild.id, 'suggestions', 'auto_reactions');
            const autoThread = await systemManager.getSystemConfig(interaction.guild.id, 'suggestions', 'auto_thread');
            const threadArchiveDuration = await systemManager.getSystemConfig(interaction.guild.id, 'suggestions', 'thread_archive_duration');
            
            // Add reactions if enabled (default: true)
            if (autoReactions !== 'false') {
                message.react('👍');
                message.react('👎');
            }
            
            // Create thread if enabled (default: true)
            if (autoThread !== 'false') {
                message.startThread({
                    name: `${name} made a suggestion`,
                    autoArchiveDuration: parseInt(threadArchiveDuration) || 60,
                    type: 'GUILD_PUBLIC_THREAD'
                });
            }
            
            try {
                await suggestionsDb.run(
                    `INSERT INTO Suggs (noSugg, Author, Message, Avatar, stat) VALUES(?, ?, ?, ?, ?)`,
                    [message.id, author, messageArgs, avatar, newStatus]
                );

            } catch(err) {
                console.log(err);
            }
        });

        interaction.reply({content: `I have sent your suggestion! Please check ${channel} to see it and interact in the thread that was created!`, ephemeral: true})




    }
}