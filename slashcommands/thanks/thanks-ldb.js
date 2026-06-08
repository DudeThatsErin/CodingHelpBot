const Discord = require('discord.js');
const connection = require('../../database.js');
const { COLORS } = require('../../logging/logger');

module.exports = {
    name: 'thanks-leaderboard',
    description: 'This gives users the ability to see the top 10 users on the leaderboard.',
    usage: `/thanks-leaderboard`,
    async execute (interaction, client) {
        let author = interaction.user.id;
        let aUsername = interaction.user.username;

        let userNames = '';
        let points = '';


        const results = await connection.all(
            `SELECT * FROM Thanks WHERE user = ?;`,
            [author]
        );

        const top10 = await connection.all(
            `SELECT user, SUM(CAST(thanks AS UNSIGNED)) AS total FROM Thanks GROUP BY user ORDER BY total DESC LIMIT 10;`
        );

        if(top10 === undefined || top10.length === 0) {
            return interaction.reply({content: 'No one is on the leaderboard yet.', ephemeral: true});
        }

        for (let i = 0; i < top10.length; i++) {
            const user = top10[i].user;
            let membr = await client.users.fetch(user).catch(err => {console.log(err);});
            let username = membr ? membr.username : user;

            userNames += `${i + 1}. ${username}\n`;
            points += `${top10[i].total}\n`;

        }


        if(results === undefined || results.length === 0) {


            let embed2 = new Discord.EmbedBuilder()
            .setTitle('This is the current thanks leaderboard.')
            .setColor(COLORS.teal)
            .addFields(
                [{name: `Top 10`, value: userNames, inline: true},
                {name: 'Thanks', value: points, inline: true},
                {name: 'How many thanks do you have?', value: `${aUsername}, you currently have \`0\` thank(s).`}]
            )
            .setFooter({text:'If there is an error here, please report this!'});

            interaction.reply({ embeds: [embed2], ephemeral: true });

         } else {
            const ponts = await connection.all(
                `SELECT thanks, SUM(CAST(thanks AS UNSIGNED)) AS total FROM Thanks WHERE user = ?;`,
                [author]
            );
            const p = ponts && ponts.length > 0 ? ponts[0].total : 0;
            let embed2 = new Discord.EmbedBuilder()
                .setTitle('This is the current thanks leaderboard.')
                .setColor(COLORS.teal)
                .addFields(
                    [{name: `Top 10`, value: userNames, inline: true},
                    {name: 'Thanks', value: points, inline: true},
                    {name: 'How many thanks do you have?', value: `${aUsername}, you currently have \`${p}\` thank(s).`}]
                )
                .setFooter({text:'If there is an error here, please report this!'});

            interaction.reply({ embeds: [embed2], ephemeral: true });
                }
    }
}