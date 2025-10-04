const { Events } = require('discord.js');

module.exports = {
    name: Events.MessageReactionAdd,
    async execute(reaction, user, client) {
        // When a reaction is received, check if the structure is partial
        if (reaction.partial) {
            try {
                await reaction.fetch();
            } catch (error) {
                console.error('Something went wrong when fetching the reaction:', error);
                return;
            }
        }

        // Ignore bot reactions
        if (user.bot) return;

        try {
            const db = require('../database.js');
            const reactionRole = await db.reactionRoles.get(reaction.message.id, reaction.emoji.toString());
            
            if (!reactionRole) return;

            const guild = reaction.message.guild;
            if (!guild) return;

            const member = await guild.members.fetch(user.id).catch(() => null);
            if (!member) return;

            const role = guild.roles.cache.get(reactionRole.role_id);
            if (!role) {
                console.error(`Role ${reactionRole.role_id} not found in guild ${guild.id}`);
                return;
            }

            // Check if member already has the role
            if (member.roles.cache.has(role.id)) return;

            await member.roles.add(role, 'Reaction role assignment');
            console.log(`Added role ${role.name} to ${member.displayName} in ${guild.name}`);

        } catch (error) {
            console.error('Error in messageReactionAdd event:', error);
        }
    },
};
