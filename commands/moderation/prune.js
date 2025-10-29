const { PermissionFlagsBits } = require('discord.js');
const config = require('../../config/config.json');

const command = {
    name: 'prune',
    aliases: ['purge', 'clear', 'delete'],
    description: 'Delete a specified number of messages from the channel',
    usage: `${config.prefix}prune <number>`,
    ownerOnly: 1,
    async execute(message, args, client) {
        // Check if user has manage messages permission using v2 PermissionFlagsBits
        if (!message.member?.permissions.has(PermissionFlagsBits.ManageMessages) && !message.member?.permissions.has(PermissionFlagsBits.Administrator)) {
            const errorContent = `❌ **Permission Denied**\n\nYou need the "Manage Messages" permission to use this command.`;
            await message.reply({ content: errorContent });
            return;
        }

        // Check if bot has manage messages permission
        if (!message.guild?.members.me?.permissions.has(PermissionFlagsBits.ManageMessages)) {
            const errorContent = `❌ **Bot Permission Missing**\n\nI need the "Manage Messages" permission to delete messages.`;
            await message.reply({ content: errorContent });
            return;
        }

        // Get the number of messages to delete
        const amount = parseInt(args[0]);

        // Validate input
        if (!args[0] || isNaN(amount)) {
            const helpContent = `❌ **Invalid Input**\n\nPlease provide a valid number of messages to delete.\n\n**Usage:** \`${config.prefix}prune <number>\`\n**Example:** \`${config.prefix}prune 10\``;
            await message.reply({ content: helpContent });
            return;
        }

        // Check range (1-99)
        if (amount < 1 || amount > 99) {
            const rangeContent = `❌ **Invalid Range**\n\nPlease provide a number between 1 and 99.\n\n**Usage:** \`${config.prefix}prune <number>\`\n**Valid Range:** 1-99 messages`;
            await message.reply({ content: rangeContent });
            return;
        }

        try {
            // Delete messages (add 1 to include the command message itself)
            const deleted = await message.channel.bulkDelete(amount + 1, true);
            
            // Send confirmation message that will auto-delete
            const successContent = `✅ **Messages Deleted**\n\nSuccessfully deleted **${deleted.size - 1}** messages.\n\n*This message will auto-delete in 3 seconds*`;
            const confirmMsg = await message.channel.send({ content: successContent });
            
            // Delete the confirmation message after 3 seconds
            setTimeout(() => {
                confirmMsg.delete().catch(() => {});
            }, 3000);

        } catch (error) {
            console.error('Error in prune command:', error);
            
            const errorContent = `❌ **Error Occurred**\n\nAn error occurred while trying to delete messages.\n\n**Common Causes:**\n• Messages older than 14 days cannot be bulk deleted\n• Bot lacks permissions\n• Network error`;
            await message.reply({ content: errorContent });
        }
    }
};

module.exports = command;
