
const { ActivityType } = require('discord.js');
const AFKManager = require('../afk-manager.js');
const ModMailManager = require('../modmail-manager.js');
const ModerationManager = require('../moderation.js');

module.exports = {
    name: 'clientReady',
    once: true,
    async execute(client) {
        console.log('|-----------------------------------|')
        console.log('          Logging In...             ')
        console.log('|-----------------------------------|')
        console.log(`   ${client.user.tag} is\n   logged in and ready!`);


        // Fixed status: let members know they can DM the bot to reach the mods.
        client.user.setActivity({
            type: ActivityType.Custom,
            name: 'custom',
            state: '📩 DM me to contact the moderators'
        });
        client.user.setStatus('online');
        console.log('📩 Status set: DM me to contact the moderators');

        // Initialize AFK Manager
        client.afkManager = new AFKManager(client);
        await client.afkManager.initialize();

        // Initialize ModMail Manager
        client.modMail = new ModMailManager(client);
        client.modMail.startAutoCloseChecker();
        console.log('✅ ModMail system initialized');

        // Initialize Moderation Manager
        client.moderation = new ModerationManager(client);
        console.log('✅ Moderation system initialized');

        console.log('|-----------------------------------|')
        console.log('             Error Logs...           ')
        console.log('|-----------------------------------|')

    }
}