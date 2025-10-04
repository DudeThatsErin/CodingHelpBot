const Discord = require('discord.js');
const bot = require('../../config/bot.json');
const ee = require('../../config/embed.json');

module.exports = {
    name: 'sub-status',
    description: 'Pushes an embed to display in the channel about a subreddit update',
    modOnly: 1,
    options: [
        {
            name: 'message',
            description: 'What would you like to announce about the subreddit?',
            type: 3,
            required: true
        }
    ],
    async execute(interaction, client) {
        const reason = interaction.options.getString('message');
        const channel = client.channels.cache.find(channel => channel.id === bot.announcementsId);
        
        let embed = new Discord.EmbedBuilder()
            .setColor(ee.sub_status)
            .setTitle('Hello, The Moderators have a new update for you!')
            .setDescription(`${reason}`)
            .setTimestamp()
            .setFooter({ text: 'Want to suggest a feature for the website? Use /suggest' });
            
        await interaction.reply({ 
            content: `I have sent the subreddit announcement for you. Please check ${channel}.`, 
            ephemeral: true 
        });
        
        channel.send({ content: `Hello <@&780111997861363742>,`, embeds: [embed] });
    }
};
