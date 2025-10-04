const bot = require('../config/bot.json');

/**
 * Gets the server configuration based on guild ID
 * @param {string} guildId - The Discord guild ID
 * @returns {Object|null} - Server configuration object or null if not found
 */
function getServerConfig(guildId) {
    if (guildId === bot.servers.onenote.id) {
        return bot.servers.onenote;
    } else if (guildId === bot.servers.mine.id) {
        return bot.servers.mine;
    }
    return null;
}

/**
 * Gets a channel from the server's configuration
 * @param {string} guildId - The Discord guild ID
 * @param {string} channelKey - The key in server config (e.g., 'generalCategoryID', 'botSpamChannelId')
 * @returns {string|null} - Channel ID or null if not found
 */
function getServerChannelId(guildId, channelKey) {
    const serverConfig = getServerConfig(guildId);
    return serverConfig ? serverConfig[channelKey] : null;
}

module.exports = {
    getServerConfig,
    getServerChannelId
};
