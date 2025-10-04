const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const bot = require('../../config/bot.json');
const token = require('../../config/config.json').token;

module.exports = {
  name: 'deletecommands',
  aliases: ['endslash', 'delete-commands', 'deletecommands', 'dc'],
  description: 'Allows Erin to delete the Slash Commands.',
  ownerOnly: 1,
  execute(message) {
    const rest = new REST({ version: '10' }).setToken(token);

    (async () => {
        try {

          //console.log('client ', message.client.slashCommands)

            await rest.put(
                Routes.applicationGuildCommands(bot.id, bot.servers.codinghelp.id),
                { body: [] },
            );

            message.reply('deleted client.slashCommands')

            await rest.put(
                Routes.applicationGuildCommands(bot.id, bot.servers.mine.id),
                { body: [] },
            );

          message.reply('deleted client.erinCommands');

        } catch (error) {
            console.error(error);
            message.react('❌');
            message.reply({content: `There was an error... ${error}`});
        }
    })();

    message.reply({content: 'deleted the commands!'});
  }
}