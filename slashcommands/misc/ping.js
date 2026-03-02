const config = require('../../config/config.json');
const { EmbedBuilder, AttachmentBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require('discord.js');
const path = require('path');

module.exports = {
    name: 'ping',
    description: 'Makes sure the bot can hear commands.',
    cooldown: 5,
    async execute(interaction, client) {
        let days = Math.floor(client.uptime / 86400000);
        let hours = Math.floor(client.uptime / 3600000) % 24;
        let minutes = Math.floor(client.uptime / 60000) % 60;
        let seconds = Math.floor(client.uptime / 1000) % 60;

        // Create the uptime string
        const uptimeString = `${days}d ${hours}h ${minutes}m ${seconds}s`;

        // Create attachment for the ping image (you'll need to add this image file)
        const attachment = new AttachmentBuilder()
            .setDescription('CodingHelp Bot Ping Image');

        try {
            // Try to create attachment from file if it exists
            const imagePath = path.join(__dirname, '../../assets/ch_ping.png');
            attachment.setFile(imagePath);
        } catch (error) {
            // If image doesn't exist, we'll send without attachment
            console.log('ch_ping.png not found, sending without image');
        }

        // Create ping embed using standard Discord.js
        const pingEmbed = new EmbedBuilder()
            .setColor(0x1ABA7C)
            .setTitle(' Pong!')
            .setImage('attachment://ch_ping.png')
            .setDescription(`Thanks for checking if r/CodingHelp was online. r/CodingHelp has been awake for **${uptimeString}**!\n\nMy command prefix is \`${config.prefix}\`.\n\nI am the official bot of the [CodingHelp](https://reddit.com/r/CodingHelp) discord server! If you want to see all of my commands run \`/help\`.`)
            .addFields({
                name: ' Useful Links',
                value: 'Click the buttons below to access helpful resources and links.',
                inline: false
            })
            .setTimestamp();

        // Create buttons for useful links
        const linksRow1 = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setLabel('Uptime')
                    .setStyle(ButtonStyle.Link)
                    .setURL('https://stats.uptimerobot.com/0pj23Sk01K'),
                new ButtonBuilder()
                    .setLabel('GitHub Repo')
                    .setStyle(ButtonStyle.Link)
                    .setURL('https://github.com/dudethatserin/codinghelp-bot/'),
                new ButtonBuilder()
                    .setLabel('Subreddit')
                    .setStyle(ButtonStyle.Link)
                    .setURL('https://reddit.com/r/CodingHelp')
            );

        const linksRow2 = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setLabel('Discord Invite')
                    .setStyle(ButtonStyle.Link)
                    .setURL('https://discord.gg/geQEUBm'),
                new ButtonBuilder()
                    .setLabel('Wiki')
                    .setStyle(ButtonStyle.Link)
                    .setURL('https://coding-help.vercel.app/')
            );

        const pingMessage = {
            embeds: [pingEmbed],
            components: [linksRow1, linksRow2]
        };

        // Send the response
        if (attachment.attachment) {
            await interaction.reply({ 
                ...pingMessage, 
                files: [attachment],
                flags: MessageFlags.Ephemeral
            });
        } else {
            await interaction.reply({
                ...pingMessage,
                flags: MessageFlags.Ephemeral
            });
        }
}};