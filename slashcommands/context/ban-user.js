module.exports = {
    name: 'Ban User',
    type: 2, // USER context menu
    modOnly: 1,
    async execute(interaction, client) {
        await client.moderation.showActionModal(interaction, 'ban', interaction.targetUser);
    }
};
