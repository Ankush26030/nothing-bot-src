const { EmbedBuilder } = require("discord.js");
const User = require('../../schema/User');

module.exports = {
  name: 'bio',
  category: 'General',
  aliases: ['setbio', 'set-bio', 'bioset'],
  cooldown: 5,
  description: '',
  args: false,
  usage: '',
  userPrams: [],
  botPrams: ['EmbedLinks'],
  owner: false,
  execute: async (message, args, client, prefix) => {
    if (args.join(' ').length > 1000) {
        return message.reply('<:x_cross:1250674944057278535> Bio must be less than 1000 characters!');
    }
    
    const msg = await message.channel.send({
      content: "Setting Bio...",
    });
    
    User.findById(message.author.id, async (err, user) => {
        if (err) {
          console.log(err);
          return msg.edit('Error setting bio. Please try again later.');
        }
        
        if (!user) {
          return msg.edit('Error setting bio. Please try again later.');
        }
        
        try {
          // Update the bio
          await user.updateOne({ bio: args.join(' ') });
          return msg.edit(`<:x_tick:1250674883080224768> Successfully set your bio to **\`${args.join(' ')}\`**`);
        } catch (error) {
          console.log(error);
          return msg.edit('Error setting bio. Please try again later.');
        }
    });
  }
};