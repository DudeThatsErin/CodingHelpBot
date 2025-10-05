const Discord = require('discord.js');
const rulesLink = 'https://codinghelp.site/Rules-for-Participating-on-r-CodingHelp-cb011ca7106148af9fb9ba64b295c969';
const bot = require('../../config/bot.json');

module.exports = {
    name: 'server-rules',
    description: 'Displays an embed with a link to read all of our Code of Conduct.',
    usage: `/server-rules`,
    ownerOnly: 1,
    execute(interaction) {
        const rulesEmbed1 = new Discord.EmbedBuilder()
            .setColor(0x3EBC38)
            .setImage('https://images-ext-1.discordapp.net/external/wbHOzT7RFJ6aTebef6VLDQZ21TQI5G0bJbWxhKRkm7U/https/images-ext-1.discordapp.net/external/IDGCI4g2TYyMowvu6pgHqMgk7ASin73_3OT8n7il_FQ/https/i.imgur.com/Pr7JkVc.png');

        const rulesEmbed2 = new Discord.EmbedBuilder()
            .setColor(0x3EBC38)
            .setTitle('Rules')
            .setDescription('This is the new location for our rules. Please read these in their entirety as they are the same regardless of where you use Coding Help. You agree to these rules by simply posting anywhere in this server or our subreddit.')
            .addFields(
                { name: '1) No Advertising', value: 'This includes but is not limited to: Only posting to share your projects, posting spam outside of # spam and posting NSFW content.' },
                { name: '2) Do not just say hi in chat or ask if you can ask something', value: 'This is HIGHLY annoying. JUST ASK YOUR QUESTION.\n\nhttps://dontasktoask.com/\nhttps://nohello.net/en/\n\nIf you do this, you will be sent `/justask` from our bot and no one will help you.' },
                { name: '3) Don\'t ping mods', value: 'Unless you are talking directly with a mod about a coding question, do not ping them. We have a bot ( 📧 @ModMail ) you can message to talk to the moderators and report things. We also have a `/report` command you can use to report things directly to 👩 @Erin .' },
                { name: '4) Please provide code WITH ALL QUESTIONS.', value: 'If you don\'t know how to format your code on Discord, you can run the command `/format @yourusernamehere` to send yourself a DM from 🤖 @Deleted User explaining how to format code on Discord.\n\nYou can also use the options below to paste your code to so that you can link it here.\n\nThis is also tied with: **Do not post screenshots of code**. Read the next few messages from our bot.' },
                { name: '5) Do not ask personal questions', value: 'These are questions that are not limited to: Age, Gender, Sexual Orientation, Race, etc. This is not a dating server, nor is it a place where those questions matter. They mean nothing when it comes to whether or not someone can code. If someone decides to share anything, they can do so using their own free will. Explicitly asking these questions will get you warned, muted, or banned depending on the circumstances. NO EXCEPTIONS.' },
                { name: '6) No spoonfeeding is done here.', value: 'We are not going to spoon feed you answers. Meaning we will not tell you exactly how to get from point A to point C without you already knowing how to do points A, B & C. Will can give you some tips on how to get from point A to point C but we will not spoon feed you the answers. Spoon feeding will not help you learn, it will only be harmful to your learning. If you are new to something, please learn the basics before asking for help with something more advanced. If you are not new and we are saying that we are spoon feeding you, then you may need to go back and re-learn the basics.\n\nhttps://smiletutor.sg/how-spoon-feeding-is-harmful-to-learning/' },
                { name: '7) Academic Dishonesty is prohibited.', value: 'Meaning we are not going to do your school work FOR you. We are not here to do your coding FOR you. We can explain it TO you but we will not code it FOR you. That doesn\'t help you. It is also guaranteed to be against your school\'s code of conduct as it doesn\'t help you learn. Similar to rule 6.' },
                { name: '8) Do not send mass DMs to users.', value: 'If you are caught DMing a massive number of people (determined by our mods) at a time, you will be permanently banned (perma-banned) from our server. We will not warn you, we will not discuss it. We do not put up with that. Please only DM users that have the DMs open role.' },
                { name: '9) Post questions in the correct channel(s).', value: 'We have # unknown to help you find the channel(s) you are looking for. You can use # general to ask WHICH channel you should post in. We are happy to point you in the right direction. Any messages posted in the incorrect channels will be **DELETED**. No questions asked. So if your message randomly gets deleted, this is a possible reason.' }
            );

            const fetchedChannel = interaction.guild.channels.cache.get('1042810437177188463'); // test bot: 1014995248163852298
            fetchedChannel.send({ embeds: [rulesEmbed1, rulesEmbed2], components: [
          {
            type: 1,
            components: [
              {
                type: 2,
                style: 5,
                label: 'View all of our rules',
                url: rulesLink
              }
            ]
          }
        ] });

        interaction.reply({content: `I have done it, please check ${fetchedChannel}!`, flags: Discord.MessageFlags.Ephemeral});

    },

};