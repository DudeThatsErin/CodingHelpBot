module.exports = {
    name: 'Warn User',
    type: 2, // USER context menu
    modOnly: 1,
    async execute(interaction, client) {
        await client.moderation.showActionModal(interaction, 'warn', interaction.targetUser);
    }
};
