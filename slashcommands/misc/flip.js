const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
	name: 'coinflip',
	description: 'Flips a coin for heads or tails',
	usage: `/coinflip`,
	async execute(interaction) {
    function doRand() {
      const rand = ['HEADS! 🪙', 'TAILS! 🪙'];
      return rand[Math.floor(Math.random()*rand.length)];
    }

    const result = doRand();
    
    const content = `# 🎲 Coin Flip Result\n\n## You got... **${result}**\n\nWant to flip again? Just run the command again!\n\n## Useful Links`;

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
          .setLabel('Discord Invite')
          .setStyle(ButtonStyle.Link)
          .setURL('https://discord.gg/geQEUBm')
      );
    
    await interaction.reply({ 
      content: content, 
      components: [buttonRow], 
      flags: 32768 
    });
  },
};