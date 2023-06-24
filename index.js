require('dotenv').config();
const token = process.env.TOKEN; // your .env file token bot discord
const PREFIXES = ['+', '/']; // you can custom prefix
const express = require('express');
const cron = require('node-cron');
const app = express();

const port = 3000; //this bots always alive 

app.get('/', (req, res) => {
  res.send('im alive');
});

app.listen(port, () => {
  console.log(`Example app listening at Port: ${port}`);
});

const { Client, MessageEmbed } = require('discord.js');
const bot = new Client();
let statusIndex = 0;
const statuses = [
  { type: 'PLAYING', activity: 'online' },
  { type: 'LISTENING', activity: 'online' },
  { type: 'WATCHING', activity: 'online' },
  { type: 'STREAMING', activity: 'online' }
];

function updateBotStatus() {
  const { type, activity } = statuses[statusIndex];
  bot.user.setActivity(activity, { type: type });

  statusIndex++;
  if (statusIndex >= statuses.length) {
    statusIndex = 0;
  }
}

bot.on('ready', () => {
  console.log('Bot has come online.');

  // Run the updateBotStatus function every minute
  cron.schedule('*/1 * * * *', () => {
    updateBotStatus();
  });
});

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

  // cannot perform orders in private messages
  if (message.channel.type === 'dm') {
    return message.channel.send('cannot perform orders in private messages');
  }

  switch (args[0]) {
    case 'msg':
      if (!message.member.roles.cache.some((role) => role.name === 'admin')) {
        return message.channel.send('');
      }
      if (!args[1]) return message.channel.send('Give me message.');
      const msg = args.slice(1).join(' ');

      message.delete({ timeout: 2000 }) // delete 2 second after you send type +msg (msg) , and this will always mentions the role @member
        .then(() => {
          const role = message.guild.roles.cache.get('821880830816157728'); //your role id
          const mention = role ? role.toString() : '@member';


          const embed = new MessageEmbed()
            .setDescription(`${mention} ${msg}`)
            .setColor('RANDOM');

          message.channel.send(embed);
        })
        .catch((error) => {
          console.error('Error deleting command message:', error);
        });
      break;
    case 'help':
      const inviteEmbed = new MessageEmbed()
        .setTitle('**title Bot**')
        .setDescription('your description help menu')
        .addField('Your filed','scond field')
        .setColor('RANDOM');

      message.channel.send(inviteEmbed);
      break;
    case 'status':
      if (!message.member.roles.cache.some((role) => role.name === 'admin')) {
        return message.channel.send('');
      }
      if (!args[1] || !args[2]) {
        return message.channel.send('usage +status [play/listen/watch/stream] [activity name]');
      }

      const command = args[1];
      const activityName = args.slice(2).join(' ');

      switch (command) {
        case 'play':
          bot.user.setActivity(activityName, { type: 'PLAYING' });
          message.channel.send(`Status succes change to play ${activityName}`);
          break;
        case 'listen':
          bot.user.setActivity(activityName, { type: 'LISTENING' });
          message.channel.send(`Status succes change to listen ${activityName}`);
          break;
        case 'stream':
          bot.user.setActivity(activityName, { type: 'STREAMING' });
          message.channel.send(`Status succes to streaming ${activityName}`);
          break;
        case 'watch':
          bot.user.setActivity(activityName, { type: 'WATCHING' });
          message.channel.send(`Status succes with watching ${activityName}`);
          break;
        default:
          message.channel.send(`usage +status [play/listen/watch] [activity name]`);
      }
      break;
  }
});

bot.login(token); // Use the token variable

function getRandomColor() {
  const colors = ['#F7931E', '#E4405F', '#4F82DD', '#43B581', '#FAA61A', '#7289DA', '#FF4D4D', '#9D4DBB', '#F47FFF', '#19E6E6', '#77DD77', '#C0C0C0', '#FDD835', '#FF5A5A', '#C485FF'];
  const randomIndex = Math.floor(Math.random() * colors.length);
  return colors[randomIndex];
}
