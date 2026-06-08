module.exports = {
    name: 'Kick User',
    type: 2, // USER context menu
    modOnly: 1,
    async execute(interaction, client) {
        await client.moderation.showActionModal(interaction, 'kick', interaction.targetUser);
    }
};
