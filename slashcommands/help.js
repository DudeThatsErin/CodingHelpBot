const { ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require("discord.js");
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
		const buttonRow = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setLabel('Our Website')
        .setStyle(ButtonStyle.Link)
        .setURL('https://codinghelp-wiki.vercel.app'),
      new ButtonBuilder()
        .setLabel('Our Subreddit')
        .setStyle(ButtonStyle.Link)
        .setURL('https://reddit.com/r/CodingHelp'),
      new ButtonBuilder()
        .setLabel('GitHub Repo')
        .setStyle(ButtonStyle.Link)
        .setURL('https://github.com/dudethatserin/codinghelp-bot/'),
      new ButtonBuilder()
        .setLabel('Discord Invite')
        .setStyle(ButtonStyle.Link)
        .setURL('https://discord.gg/geQEUBm')
    );

		const cmdd = interaction.options.getString('commandname');

		if (cmdd) {
			// Search for specific command
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
				return interaction.reply({ content: "❌ **Command Not Found**\n\nThat command could not be found! Use `/help` to see all available commands.", ephemeral: true });
			}

			// Create rich content for specific command help
			let content = `# Help for \`${foundCommand.name}\`\n\n`;
			
			if (foundCommand.description) {
				content += `${foundCommand.description}\n\n`;
			}
			
			if (foundCommand.aliases && Array.isArray(foundCommand.aliases) && foundCommand.aliases.length > 0) {
				content += `**Aliases:** ${foundCommand.aliases.map(alias => `\`${alias}\``).join(', ')}\n\n`;
			}
			
			if (foundCommand.usage) {
				content += `**Usage:** ${foundCommand.usage}\n\n`;
			}
			
			if (foundCommand.example) {
				content += `**Example:** ${foundCommand.example}\n\n`;
			}
			
			content += `## Useful Links\nView all commands on our [website](https://codinghelp-wiki.vercel.app)!`;

			await interaction.reply({ 
				content: content, 
				components: [buttonRow], 
				flags: MessageFlags.Ephemeral 
			});

		} else {
			// Show all commands overview
			let content = `# CodingHelp Bot - All Commands\n\n`;
			content += `These are all of the commands r/CodingHelp can do. If you want to get more information you can do \`/help <command>\`.\n\n`;

			// Add prefix commands
			if (commandList.prefix_commands) {
				Object.keys(commandList.prefix_commands).forEach(category => {
					const commands = commandList.prefix_commands[category];
					if (commands && commands.length > 0) {
						content += `## ${category} (Prefix Commands)\n`;
						content += `\`\`\`\n${commands.map(cmd => cmd.name).join('\n')}\`\`\`\n\n`;
					}
				});
			}

			// Add slash commands
			if (commandList.slash_commands) {
				Object.keys(commandList.slash_commands).forEach(category => {
					const commands = commandList.slash_commands[category];
					if (commands && commands.length > 0) {
						content += `## ${category} (Slash Commands)\n`;
						content += `\`\`\`\n${commands.map(cmd => cmd.name).join('\n')}\`\`\`\n\n`;
					}
				});
			}

			content += `## Useful Links\nView detailed command documentation on our [website](https://codinghelp-wiki.vercel.app)!`;

			await interaction.reply({ 
				content: content, 
				components: [buttonRow], 
				flags: MessageFlags.Ephemeral 
			});
		}
	},
};