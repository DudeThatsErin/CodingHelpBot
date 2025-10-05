const { EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require("discord.js");
const ee = require('../config/embed.json');
const commandList = require('../command-list.json');

module.exports = {
	name: 'help',
	description: 'This allows users to find out more information on all of our commands.',
	options: [
		{
			name: 'commandname',
			description: 'Type command name here or leave blank to see all commands.',
			required: false,
			type: 3
		}
	],
	usage: '/help or /help [command name here]',
	async execute(interaction, client) {
		const roleColor = 0x008080;

		const row = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setLabel('Our Website')
        .setStyle(5)
        .setURL('https://codinghelp-wiki.vercel.app'),
      new ButtonBuilder()
        .setLabel('Our Subreddit')
        .setStyle(5)
        .setURL('https://reddit.com/r/CodingHelp')
    );

		// Function to create command list string from commands array
		const createCommandListString = (commands) => {
			return commands.map(cmd => cmd.name).join('\n');
		};

		// Create fields for the main help embed
		const fields = [];

		// Add prefix commands
		if (commandList.prefix_commands) {
			Object.keys(commandList.prefix_commands).forEach(category => {
				const commands = commandList.prefix_commands[category];
				if (commands && commands.length > 0) {
					fields.push({
						name: `${category} (Prefix Commands)`,
						value: `\`\`\`css\n${createCommandListString(commands)}\`\`\``,
						inline: true
					});
				}
			});
		}

		// Add slash commands
		if (commandList.slash_commands) {
			Object.keys(commandList.slash_commands).forEach(category => {
				const commands = commandList.slash_commands[category];
				if (commands && commands.length > 0) {
					fields.push({
						name: `${category} (Slash Commands)`,
						value: `\`\`\`css\n${createCommandListString(commands)}\`\`\``,
						inline: true
					});
				}
			});
		}

		const mainEmbed = new EmbedBuilder()
			.setColor(roleColor)
			.setTitle('CodingHelp Bot - All Commands')
			.setDescription('These are all of the commands r/CodingHelp can do. If you want to get more information you can do `/help <command>`.')
			.addFields(fields)
			.setFooter({ text: ee.footertext, iconURL: ee.footericon });

		let cmdd = interaction.options.getString('commandname');

		if (cmdd) {
			// Search for specific command in the command list JSON
			let foundCommand = null;
			
			// Search in prefix commands
			if (commandList.prefix_commands) {
				Object.values(commandList.prefix_commands).forEach(categoryCommands => {
					const cmd = categoryCommands.find(c => c.name === cmdd || (c.aliases && c.aliases.includes(cmdd)));
					if (cmd) foundCommand = cmd;
				});
			}
			
			// Search in slash commands
			if (!foundCommand && commandList.slash_commands) {
				Object.values(commandList.slash_commands).forEach(categoryCommands => {
					const cmd = categoryCommands.find(c => c.name === cmdd || (c.aliases && c.aliases.includes(cmdd)));
					if (cmd) foundCommand = cmd;
				});
			}

			// Also check the client collections as fallback
			if (!foundCommand) {
				foundCommand = client.slashCommands.get(cmdd) || client.commands.get(cmdd) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(cmdd));
			}

			if (!foundCommand) {
				return interaction.reply({ content: "That command could not be found!", ephemeral: true });
			}

			const emb = new EmbedBuilder()
				.setColor(roleColor)
				.setTitle(`Help for \`${foundCommand.name}\``);
			
			if (foundCommand.description) {
				emb.setDescription(foundCommand.description);
			} else {
				emb.setDescription("No description could be found");
			}
			
			if (foundCommand.aliases && Array.isArray(foundCommand.aliases) && foundCommand.aliases.length > 0) {
				emb.addFields({name: "Aliases", value: foundCommand.aliases.join(", ")});
			}
			
			if (foundCommand.usage) {
				emb.addFields({name: "Usage", value: foundCommand.usage});
			}
			
			if (foundCommand.example) {
				emb.addFields({name: "Example Usage", value: foundCommand.example});
			}
			
			emb.addFields({name: 'You can also view all of our commands on our website:', value: 'https://codinghelp-wiki.vercel.app'});
			emb.setFooter({ text: ee.footertext, iconURL: ee.footericon });

			interaction.reply({ embeds: [emb], components: [row], ephemeral: true });

		} else {
			// Show all commands in a single embed
			interaction.reply({ embeds: [mainEmbed], components: [row], ephemeral: true });
		}
	},
};