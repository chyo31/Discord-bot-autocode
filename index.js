const { Client, MessageEmbed, Intents } = require('discord.js');
const PREFIXES = ['+', '-'];
const token = process.env.TOKEN;
const axios = require('axios');
const express = require('express');
const app = express();

const port = 3000; //this bots always alive 

app.get('/', (req, res) => {
  res.send('im alive');
});

app.listen(port, () => {
  console.log(`Example app listening at Port: ${port}`);
});
const serverIP = 'hypixel.net';
const serverPort = 25565;
const bot = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
});

bot.on('ready', () => {
  console.log('I'm ready.');

  function updateActivity() {
    axios.get(`https://eu.mc-api.net/v3/server/ping/${serverIP}:${serverPort}`)
      .then((response) => {
        const playerCount = response.data.players.online;
        const maxPlayers = response.data.players.max;

        bot.user.setActivity(`Online Players: ${playerCount}/${maxPlayers}`, { type: 'STREAMING' });
      })
      .catch((error) => {
        console.error(error);
      });
  }

  updateActivity();

  setInterval(updateActivity, 60000);
}); //refresh every 1 minute

bot.on('message', (message) => {
  let args;
  let prefixUsed = null;

  for (const prefix of PREFIXES) {
    if (message.content.startsWith(prefix)) {
      args = message.content.substring(prefix.length).split(' ');
      prefixUsed = prefix;
      break;
    }
  }

  if (!args) return;

  if (message.channel.type === 'dm') {
    return message.channel.send('Cannot be in private messages');
  }

switch (args[0]) {
    case 'msg':
      if (!message.member.roles.cache.some((role) => role.name === 'admin')) {
        return message.channel.send('');
      }
      if (!args[1]) return message.channel.send('give me message.');
      const msg = args.slice(2).join(' ');

      message.delete({ timeout: 2000 }) //auto delete your original message 2 second
        .then(() => {
          const channel = bot.channels.cache.get(args[1]);
          if (!channel) return message.channel.send('channel (channel) not found.');

          channel.send(msg);
        })
        .catch((error) => {
          console.error('Error deleting command message:', error);
        });
     break;
    case 'help':
      const inviteEmbed = new MessageEmbed()
        .setTitle('**Bot Title**')
        .setDescription('description')
        .addField('one field', 'two field')
        .setColor('RANDOM');

      message.channel.send(inviteEmbed);
      break;
    case 'kick':
      if (!message.member.roles.cache.some((role) => role.name === 'admin')) {
        return message.channel.send('Make sure you have an admin role .');
      }
      if (!args[0]) return message.channel.send('give me user to kick.');

      const user = message.mentions.users.first();
      if (!user) return message.channel.send('user not valid.');

      const member = message.guild.member(user);
      if (!member) return message.channel.send('cannot find user.');

      member
        .kick()
        .then(() => {
          message.channel.send(`user ${user.tag} succes kicked from the server.`);
        })
        .catch((error) => {
          console.error('Error kicking user:', error);
          message.channel.send('An error has occurred');
        });
      break;
  }
});

bot.login(token);
