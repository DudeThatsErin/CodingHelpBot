const Discord = require('discord.js');
const connection = require('../../database.js');
const config = require('../../config/config.json');

module.exports = {
    name: 'add-points',
    description: 'This allows **mods** to automatically add points to a participant\'s challenge to the Challenges database.',
    aliases: ['addpnts', 'pluspnts', 'addpoints', 'apnts', 'pluspoints'],
    usage: `${config.prefix}add-points <message ID> <number of points>`,
    example: `${config.prefix}add-points 850726247050903562 3`,
    challengeMods: 1,
    async execute (message, args) {
        // Check if challenge system is enabled
        const { isSystemEnabled } = require('../../database-init.js');
        const challengeSystemEnabled = await isSystemEnabled(message.guild.id, 'challenges');
        
        if (!challengeSystemEnabled) {
            message.react('❌');
            message.channel.send({content: 'The challenge system is not enabled for this server. Please ask a moderator to run `/enable-challenge-system` first.'});
            return;
        }
            let msgId = args[0];
            let author = message.author.username;
            let name = message.author.id;
            let points = args[1];
            const results = await connection.all(
                `SELECT * FROM Submissions WHERE msgId = ?;`,
                [msgId]
            );
            if (!results || results.length === 0) {
                message.react('❌');
                message.channel.send({content: 'No submission found with that message ID.'});
                return;
            }
            let player = results[0].author;
            let playerID = await message.client.users.fetch(player).catch(err => {console.log(err);});
            let playerName = playerID.username;

        if (!msgId) {
                message.react('❌')
                message.channel.send({content: 'You need to include the submission\'s message ID of the submission you want to add points to.'});
                return;
            } else {

                    let embed = new Discord.EmbedBuilder()
                        .setColor(0xc9a066)
                        .setTitle(`I have added ${points} points to ${playerName}!`)
                        .setDescription(`Thank you for that, ${author}!`)
                        .setFooter('If there is a problem with this, please report it!');

                    await connection.run(
                        `UPDATE Submissions SET moderator = ?, points = points + ? WHERE msgId = ?;`,
                        [name, points, msgId]
                    );
                message.channel.send({ embeds: [embed] });

            }

    }
}