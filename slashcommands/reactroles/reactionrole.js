const Discord = require('discord.js');
const db = require('../../database.js');

module.exports = {
    name: 'reactionrole',
    description: 'Set up or remove reaction roles',
    usage: `/reactionrole <enable|disable|disable_all> <message_id> <emoji> <role>`,
    example: `/reactionrole enable 1413891412415484004 :heart: @Member`,
    modOnly: 1,
    options: [
        {
            name: 'action',
            description: 'Enable or disable reaction roles',
            type: 3,
            required: true,
            choices: [
                { name: 'Enable', value: 'enable' },
                { name: 'Disable', value: 'disable' },
                { name: 'Disable All', value: 'disable_all' }
            ]
        },
        {
            name: 'message_id',
            description: 'ID of the message to apply reaction roles to (not required for disable all)',
            type: 3,
            required: false
        },
        {
            name: 'emoji',
            description: 'Emoji to react with (required for enable)',
            type: 3,
            required: false
        },
        {
            name: 'role',
            description: 'Role to assign (required for enable)',
            type: 8,
            required: false
        }
    ],    
    async execute(interaction, client) {
        const action = interaction.options.getString('action');
        const messageId = interaction.options.getString('message_id');
        const emoji = interaction.options.getString('emoji');
        const role = interaction.options.getRole('role');

        // Check permissions
        if (!interaction.member.permissions.has(Discord.PermissionFlagsBits.ManageRoles)) {
            return await interaction.reply({
                content: '❌ You need "Manage Roles" permission to use this command.',
                flags: Discord.MessageFlags.Ephemeral
            });
        }

        switch (action) {
            case 'disable_all':
                // Confirm action with user
                await interaction.reply({
                    content: '⚠️ This will remove ALL reaction roles in this server and clear all bot reactions. Are you sure? Reply with "CONFIRM" to proceed.',
                    flags: Discord.MessageFlags.Ephemeral
                });

                // Wait for confirmation
                const filter = (m) => m.author.id === interaction.user.id && m.content === 'CONFIRM';
                try {
                    await interaction.channel.awaitMessages({ filter, max: 1, time: 30000, errors: ['time'] });
                } catch {
                    return await interaction.followUp({
                        content: '❌ Confirmation timeout. Action cancelled.',
                        flags: Discord.MessageFlags.Ephemeral
                    });
                }

                // Get all reaction roles for this guild
                const allReactionRoles = await db.reactionRoles.getAll(interaction.guild.id);
                
                if (allReactionRoles.length === 0) {
                    return await interaction.followUp({
                        content: '❌ No reaction roles found in this server.',
                        flags: Discord.MessageFlags.Ephemeral
                    });
                }

                // Remove all bot reactions
                let removedReactions = 0;
                for (const reactionRole of allReactionRoles) {
                    try {
                        const channel = interaction.guild.channels.cache.get(reactionRole.channel_id);
                        if (channel) {
                            const message = await channel.messages.fetch(reactionRole.message_id);
                            const reaction = message.reactions.cache.get(reactionRole.emoji);
                            if (reaction) {
                                await reaction.users.remove(client.user.id);
                                removedReactions++;
                            }
                        }
                    } catch (error) {
                        console.log(`Could not remove reaction from message ${reactionRole.message_id}:`, error.message);
                    }
                }

                // Clear all from database
                const result = await db.reactionRoles.getAll(interaction.guild.id);
                for (const rr of result) {
                    await db.reactionRoles.remove(rr.message_id, rr.emoji);
                }

                await interaction.followUp({
                    content: `✅ Removed ${allReactionRoles.length} reaction role(s) and ${removedReactions} bot reaction(s) from this server.`,
                    flags: Discord.MessageFlags.Ephemeral
                });
                break;

            case 'enable':
                if (!emoji || !role) {
                    return await interaction.reply({
                        content: '❌ Both emoji and role are required for enabling reaction roles.',
                        flags: Discord.MessageFlags.Ephemeral
                    });
                }

                // Verify the message exists
                let message;
                try {
                    message = await interaction.channel.messages.fetch(messageId);
                    console.log('message ', message)
                } catch (error) {
                    return await interaction.reply({
                        content: '❌ Message not found in this channel.',
                        flags: Discord.MessageFlags.Ephemeral
                    });
                }

                // Check if bot can manage the role
                if (role.position >= interaction.guild.members.me.roles.highest.position) {
                    console.log('role.position ', role.position)
                    console.log('interaction.guild.members.me.roles.highest.position ', interaction.guild.members.me.roles.highest.position)
                    return await interaction.reply({
                        content: '❌ I cannot assign roles higher than or equal to my highest role.',
                        flags: Discord.MessageFlags.Ephemeral
                    });
                }

                // Add to database
                const enableResult = await db.reactionRoles.add(
                    interaction.guild.id,
                    interaction.channel.id,
                    messageId,
                    emoji,
                    role.id
                );
                console.log('enableResult ', enableResult)

                if (!enableResult.success) {
                    console.log('enableResult.error ', enableResult.error)
                    return await interaction.reply({
                        content: `❌ ${enableResult.error}`,
                        flags: Discord.MessageFlags.Ephemeral
                    });
                }

                // Add bot reaction to the message
                try {
                    console.log('emoji ', emoji)
                    await message.react(emoji);
                } catch (error) {
                    console.log('error ', error)
                    // Cleanup database entry if reaction fails
                    await db.reactionRoles.remove(messageId, emoji);
                    return await interaction.reply({
                        content: `❌ Failed to add reaction: ${error.message}`,
                        flags: Discord.MessageFlags.Ephemeral
                    });
                }

                await interaction.reply({
                    content: `✅ Reaction role enabled!\n**Message:** ${messageId}\n**Emoji:** ${emoji}\n**Role:** ${role}`,
                    flags: Discord.MessageFlags.Ephemeral
                });
                break;

            case 'disable':
                if (!messageId) {
                    return await interaction.reply({
                        content: '❌ Message ID is required for disabling individual reaction roles.',
                        flags: Discord.MessageFlags.Ephemeral
                    });
                }

                const disableResult = await db.reactionRoles.remove(messageId, emoji);

                if (!disableResult.success) {
                    return await interaction.reply({
                        content: `❌ Error: ${disableResult.error}`,
                        flags: Discord.MessageFlags.Ephemeral
                    });
                }

                if (disableResult.changes === 0) {
                    return await interaction.reply({
                        content: '❌ No reaction roles found for the specified message/emoji.',
                        flags: Discord.MessageFlags.Ephemeral
                    });
                }

                // Remove bot reactions if specified
                if (emoji) {
                    try {
                        const message = await interaction.channel.messages.fetch(messageId);
                        const reaction = message.reactions.cache.get(emoji);
                        if (reaction) {
                            await reaction.users.remove(client.user.id);
                        }
                    } catch (error) {
                        // Ignore errors when removing reactions
                        console.log('Could not remove bot reaction:', error.message);
                    }
                }

                await interaction.reply({
                    content: `✅ Removed ${disableResult.changes} reaction role(s) for message ${messageId}.`,
                    flags: Discord.MessageFlags.Ephemeral
                });
                break;
        }
    },
};
