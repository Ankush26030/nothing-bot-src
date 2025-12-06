const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require("discord.js");

module.exports = {
    name: "say",
    category: "Dev",
    aliases: "",
    description: "",
    args: false,
    usage: "",
    userPerms: [],
    owner: false,
    execute: async (message, args, client, prefix) => {
    let Ankush2 = ["239496212699545601", "622786214776406017"];
      if(!Ankush2.includes(message.author.id)) return
      
      const ankush = client.users.cache.get('239496212699545601');
  
   const sayMessage = message.content.split(' ').slice(1).join(' ');
    if (!sayMessage) {
      const me = new EmbedBuilder()
        .setColor('#ff0000')
        .setAuthor({name: `Hey ${message.author.tag} Developed By Ankush </>`, iconURL: ankush.displayAvatarURL({dynamic: true})})
      return message.reply({embeds: [me]})
    }

    if (sayMessage) {
      message.delete();
   message.channel.send({content: `${sayMessage}`}), {
      allowedMentions: { parse: ["users"] },
    };
     }
  },
};