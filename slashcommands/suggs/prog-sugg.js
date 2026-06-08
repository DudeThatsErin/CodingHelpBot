const Discord = require('discord.js');
const connection = require('../../database.js');
const bot = require('../../config/bot.json');
const { COLORS } = require('../../logging/logger');

module.exports = {
    name: 'suggestionprogress',
    description: 'Allows **mods** to mark a particular suggestion as *in progress*.',
    usage: `/suggestionprogress messageID [status message]`,
    example: `/suggestionprogress 847580954306543616 This is the in-progress status for this suggestion.`,
    modOnly: 1,
    options: [
        {
            name: 'messageid',
            description: 'What is the message ID for the suggestion you would like to mark as in progress?',
            type: 3,
            required: true
        },
        {
            name: 'message',
            description: 'What is the in progress message?',
            type: 3,
            required: true
        }
    ],
    async execute(interaction, client) {

            const msgId = interaction.options.getString('messageid');
                try {
                    await connection.all(
                        `SELECT noSugg from Suggs WHERE noSugg = ?;`,
                        [msgId]
                    );
                } catch(error) {
                    interaction.reply({content: 'There was an error grabbing the ID from the database. Please report this!'});
                    console.log(error);
                    return;
                }

            const result2 = await connection.all(
                `SELECT Author, Name from Suggs WHERE noSugg = ?;`,
                [msgId],
            );
            const OGauthor = result2[0].Author;
            const aut = await interaction.guild.members.fetch(OGauthor).catch(() => null);
            // Prefer the name stored in the DB; fall back to the live member, then a generic label.
            let name = result2[0].Name || (aut ? aut.user.tag : 'Unknown User');

            const result3 = await connection.all(
                `SELECT Message from Suggs WHERE noSugg = ?;`,
                [msgId],
            );
            const suggestion = result3[0].Message;

            const result4 = await connection.all(
                `SELECT Avatar from Suggs WHERE noSugg = ?;`,
                [msgId],
            );
            const avatar = result4[0].Avatar;
            const mod = interaction.user.id;
            const stats = interaction.options.getString('message');

                await connection.run(
                    `UPDATE Suggs SET stat = ?, Moderator = ? WHERE noSugg = ?;`,
                    [stats, mod, msgId],
                );

            const result8 = await connection.all(
                `SELECT stat FROM Suggs WHERE noSugg = ?;`,
                [msgId]
            );
            const upStatus = result8[0].stat;

            const moderator = await connection.all(
                `SELECT Moderator FROM Suggs WHERE noSugg = ?;`,
                [msgId]
            );
            const moder = moderator[0].Moderator;
            const moderate = moder.tag || interaction.user.tag;

            const inprogress = new Discord.EmbedBuilder()
                .setColor(COLORS.teal)
                .setAuthor({name: name, iconURL: avatar})
                .setDescription(suggestion)
                .addFields(
                    [{ name: 'Current Status', value: upStatus},
                    { name: 'The moderator that last updated this was', value: moderate},]
                )
                .setFooter({text: `If you would like to suggest something, use /suggestions`});

            const updated = new Discord.EmbedBuilder()
                .setColor(COLORS.teal)
                .setAuthor({name: name, iconURL: avatar})
                .setDescription(suggestion)
                .addFields(
                    [{ name: 'Your suggestion has been updated! This is the current status:', value: upStatus},
                    { name: 'Moderator that updated your suggestion:', value: moderate},]
                )
                .setTimestamp()
                .setFooter({text: 'If you don\'t understand this status, please contact the moderator that updated your suggestion. Thank you!'});

                if (aut) await aut.send({ embeds: [updated] }).catch(() => {});
            interaction.reply({content: `The suggestion has been updated in the channel and the message was sent. 😃`});

            const chnnel = client.channels.cache.find(c => c.id === bot.suggestionsId);
            chnnel.messages.fetch(msgId).then(message => {
                if (message) message.edit({ embeds: [inprogress] });
                    if(message) message.reactions.removeAll().catch(error => console.error('Failed to clear reactions: ', error));
                }
            ).catch(console.error);
    }
};