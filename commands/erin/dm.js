const { ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require('discord.js');
const config = require('../../config/config.json');
const { COLORS } = require('../../logging/logger');

module.exports = {
  name: 'dm',
  description: 'Shoots an official embed to a user that is replied to or pinged.',
  usage: `${config.prefix}dm <@username>`,
  example: `${config.prefix}dm @DudeThatsErin`,
  modOnly: 1,
  async execute(message, args) {

    const row = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setLabel('Our Website')
        .setStyle(ButtonStyle.Link)
        .setURL('https://codinghelp.site'),
      new ButtonBuilder()
        .setLabel('Our Subreddit')
        .setStyle(ButtonStyle.Link)
        .setURL('https://reddit.com/r/CodingHelp')
    );

    if (message.reference === null) { // just a regular message
      const user = message.mentions.users?.first() || message.guild.members.cache.get(args[0]);
      if (!user) {
        message.channel.send({ content: 'You need to specify a user via mention or the ID.' });
        message.delete();
        return;
      }
      else {
        const saying = args.slice(1).join(' ')

        const dm = {
          color: COLORS.blurple,
          title: `You received a DM from r/CodingHelp`,
          thumbnail: {
            url: 'https://imgur.com/U6cwQxj.png'
          },
          description: `${message.author} sent you the following message:\`\`\`${saying}\`\`\`\nIf you have any questions, please send a message to <@575252669443211264>.`,
          timestamp: new Date(),
          footer: {
            text: `This is not an official warning.`,
            icon_url: 'https://imgur.com/U6cwQxj.png'
          }
        }
        // Send content, embed, and components separately
        await user.send({ content: `Hey, ${user.username}!` });
        await user.send({ embeds: [dm] });
        await user.send({ components: [row] });
        message.react('👍');
      }
    } else {
      const saying = args.slice(0).join(' ');

      const dm = {
        color: COLORS.blurple,
        title: `You received a DM from r/CodingHelp`,
        thumbnail: {
          url: 'https://imgur.com/U6cwQxj.png'
        },
        description: `${message.author} sent you the following message:\`\`\`${saying}\`\`\`\nIf you have any questions, please send a message to <@575252669443211264>.`,
        timestamp: new Date(),
        footer: {
          text: `This is not an official warning.`,
          icon_url: 'https://imgur.com/U6cwQxj.png'
        }
      }
      const user = message.mentions.repliedUser;
      // Send content, embed, and components separately
      await user.send({ content: `Hey, ${user.username}!` });
      await user.send({ embeds: [dm] });
      await user.send({ components: [row] });
      message.react('👍');
    }
  },

}