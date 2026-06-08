const Discord = require('discord.js')
const connection = require('../../database.js');
const bot = require('../../config/bot.json');
const { COLORS } = require('../../logging/logger');

module.exports = {
    name: 'completedsugg',
    description: 'Marks a specific suggestion as completed.',
    usage: `/completedsugg messageID [reason]`,
    example: `/completedsugg 847580954306543616 I have completed your suggestion!`,
    modOnly: 1,
    options: [
        {
            name: 'messageid',
            description: 'What is the message ID for the suggestion you would like to complete?',
            type: 3,
            required: true
        },
        {
            name: 'message',
            description: 'What is the completed message?',
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
                    interaction.reply({content:'There was an error grabbing the ID from the database. Please report this!'});
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
                    const name = result2[0].Name || (aut ? aut.user.username : 'Unknown User');

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

    
                mod = interaction.user.id;
    
                const stats = interaction.options.getString('message');
    
                try {
                    await connection.run(
                        `UPDATE Suggs SET stat = ?, Moderator = ? WHERE noSugg = ?;`,
                        [stats, mod, msgId],
                    );
                } catch (error) {
                    interaction.reply({content: 'There was an error updating the suggestion in the database. Please report this!'});
                    console.log(error);
                    return;
                }
    

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

            
                const denied = new Discord.EmbedBuilder()
                    .setColor(COLORS.green)
                    .setAuthor({name: name, iconURL:avatar})
                    .setDescription(suggestion)
                    .addFields(
                        [{ name: 'Your suggestion was completed! This is the decision:', value: upStatus},
                        { name: 'Moderator that completed your suggestion:', value: moderate},]
                    )
                    .setTimestamp()
                    .setFooter({text: 'If you don\'t understand this decision, please contact the moderator that completed your suggestion. Thank you!'});
    
            
                if (aut) await aut.send({ embeds: [denied] }).catch(() => {});
                interaction.reply({content:`I have done that for you. The message is now deleted in the suggestions channel. 😃`});

                    try {
                        await connection.run(
                            `DELETE FROM Suggs WHERE noSugg = ? AND Author = ?;`,
                            [msgId, OGauthor],
                        );
                    } catch (error) {
                        interaction.followUp({content: 'There was an error deleting the suggestion from the database. Please report this!'});
                        console.log(error);
                        return;
                    }
        
                    const chnnel = await client.channels.cache.find(c => c.id === bot.suggestionsId);
                    chnnel.messages.fetch(msgId).then(message => {
                        message.delete(); 
                    });
    }
};