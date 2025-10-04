const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const bot = require('../../config/bot.json');
const token = require('../../config/config.json').token;

module.exports = {
  name: 'createcommands',
  aliases: ['startslash', 'create-commands', 'createcommands', 'cc'],
  description: 'Allows Erin to create the Slash Commands.',
  ownerOnly: 1,
  execute(message) {
    const rest = new REST({ version: '10' }).setToken(token);

    (async () => {
        try {
            // Extract only the command data (not the execute functions)
            const slashCommandsData = message.client.slashCommands.map(cmd => ({
                name: cmd.name,
                description: cmd.description,
                options: cmd.options || []
            }));
            console.log('client slashCommands ', message.client.slashCommands)

            const erinCommandsData = message.client.erinCommands.map(cmd => ({
                name: cmd.name,
                description: cmd.description,
                options: cmd.options || []
            }));
            console.log('client erinCommands ', message.client.erinCommands)

            const rest1 = await rest.put(
                Routes.applicationGuildCommands(bot.id, bot.servers.codinghelp.id),
                { body: slashCommandsData },
            );
            console.log('rest1 ', rest1)

            const rest2 = await rest.put(
                Routes.applicationGuildCommands(bot.id, bot.servers.mine.id),
                { body: erinCommandsData },
            );
            console.log('rest2 ', rest2)

            message.reply('✅ Successfully created slash commands for both servers!')

        } catch (error) {
            console.error(error);
            message.react('❌');
            message.reply({content: `There was an error... ${error}`});
        }
    })();
  }
}