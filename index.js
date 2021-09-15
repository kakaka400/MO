const { Client } = require("discord.js");
const keepAlive = require('./server.js');
 
const client = new Client({
  disableEveryone: true
});
 
keepAlive();
client.login(process.env.TOKEN);

const discord = require("discord.js");
const { prefix, ServerID } = require("./config.json")
const config = require('./config.json');

client.on("ready", () => {

    console.log("Bot online")
    client.user.setActivity("/help", { type: "HELPING", url:""})
})



client.on("channelDelete", (channel) => {
    if (channel.parentID == channel.guild.channels.cache.find((x) => x.name == "MODMAIL").id) {
        const person = channel.guild.members.cache.find((x) => x.id == channel.name)

        if (!person) return;

        let yembed = new discord.MessageEmbed()
            .setAuthor("MAIL Closed", client.user.displayAvatarURL())
            .setColor('RED')
      
        return person.send(yembed)

    }


})





client.on("message", async message => {
    if (message.author.bot) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    let command = args.shift().toLowerCase();


    if (message.guild) {

        if (command == "mod-mail") {
            if (!message.content.startsWith(prefix)) return;
            if (!message.member.hasPermission("ADMINISTRATOR")) {
                return message.channel.send("You need Admin Permissions to setup the modmail system!")
            }

            if (!message.guild.me.hasPermission("ADMINISTRATOR")) {
                return message.channel.send("Bot need Admin Permissions to setup the modmail system!")
            }


            let role = message.guild.roles.cache.find((x) => x.name == "Support Team Member")
            let everyone = message.guild.roles.cache.find((x) => x.name == "@everyone")

            if (!role) {
                role = await message.guild.roles.create({
                    data: {
                        name: "captain motchy´s team",
                        color: "RED"
                    },
                    reason: "Role needed for ModMail System"
                })
            }

            await message.guild.channels.create("MODMAIL", {
                type: "category",
                topic: "All the mail will be here",
                permissionOverwrites: [
                    {
                        id: role.id,
                        allow: ["VIEW_CHANNEL", "SEND_MESSAGES", "READ_MESSAGE_HISTORY"]
                    },
                    {
                        id: everyone.id,
                        deny: ["VIEW_CHANNEL", "SEND_MESSAGES", "READ_MESSAGE_HISTORY"]
                    }
                ]
            })


            return message.channel.send("Setup is Completed ✅")

        } else if (command == "close") {
            if (!message.content.startsWith(prefix)) return;
            if (!message.member.roles.cache.find((x) => x.name == "Staff")) {
                return message.channel.send("You need Staff role to use this command")
            }
            if (message.channel.parentID == message.guild.channels.cache.find((x) => x.name == "MODMAIL").id) {

                const person = message.guild.members.cache.get(message.channel.name)

                if (!person) {
                    return message.channel.send("I am Unable to close the channel and this error is coming because probaly channel name is changed.")
                }

                await message.channel.delete()

                let yembed = new discord.MessageEmbed()
                    .setAuthor("MAIL CLOSED", client.user.displayAvatarURL())
                    .setColor("RED")
                    .setThumbnail(client.user.displayAvatarURL())
                    .setFooter("Mail is closed by " + message.author.username)
                if (args[0]) yembed.setDescription(`Reason: ${args.join(" ")}`)

                return person.send(yembed)

            }
        } else if (command == "open") {
            if (!message.content.startsWith(prefix)) return;
            const category = message.guild.channels.cache.find((x) => x.name == "MODMAIL")

            if (!category) {
                return message.channel.send("Modmail system is not setuped in this server, use " + prefix + "setup")
            }

            if (!message.member.roles.cache.find((x) => x.name == "Staff")) {
                return message.channel.send("You need `Staff` role to use this command")
            }

            if (isNaN(args[0]) || !args.length) {
                return message.channel.send("Please Give the ID of the person")
            }

            const target = message.guild.members.cache.find((x) => x.id === args[0])

            if (!target) {
                return message.channel.send("Unable to find this person.")
            }


            const channel = await message.guild.channels.create(target.id, {
                type: "text",
                parent: category.id,
                topic: "Mail is Direct Opened by **" + message.author.username + "** to make contact with " + message.author.tag
            })

            let nembed = new discord.MessageEmbed()
                .setAuthor("DETAILS", target.user.displayAvatarURL({ dynamic: true }))
                .setColor("RED")
                .setThumbnail(target.user.displayAvatarURL({ dynamic: true }))
                .setDescription(message.content)
                .addField("Name", target.user.username)
                .addField("Account Creation Date", target.user.createdAt)
               

            channel.send(nembed)

            let uembed = new discord.MessageEmbed()
                .setAuthor("DIRECT MAIL OPENED")
                .setColor("RED")
                .setThumbnail(client.user.displayAvatarURL())
                .setDescription("You have been contacted by Staff of **" + message.guild.name + "**, Please wait until staff send another message to you");


            target.send(uembed);

            let newEmbed = new discord.MessageEmbed()
                .setDescription("Opened The Mail: <#" + channel + ">")
                .setColor("RED");

            return message.channel.send(newEmbed);
        } else if (command == "help") {
            if (!message.content.startsWith(prefix)) return;
            let embed = new discord.MessageEmbed()
                .setAuthor('MODMAIL BOT') 
                .addField("Setup", "With /setup you can setup the ModMail system", true)

                .addField("Open", 'With /Open you can open a mail with someone, just type /Open and the discord ID of the person', true)
                .setThumbnail(client.user.displayAvatarURL())
                .addField("Close", 'With /Close you can close a mail', true);

            return message.channel.send(embed)

        }
    }







    if (message.channel.parentID) {

        const category = message.guild.channels.cache.find((x) => x.name == "MODMAIL")

        if (message.channel.parentID == category.id) {
            let member = message.guild.members.cache.get(message.channel.name)

            if (!member) return message.channel.send('Unable To Send Message')

            let lembed = new discord.MessageEmbed()
                .setColor("GREEN")
                .setAuthor(message.author.username, message.author.displayAvatarURL({ dynamic: true }))
                .setDescription(message.content)

            return member.send(lembed)
        }


    }

    if (!message.guild) {
        const guild = await client.guilds.cache.get(ServerID) || await client.guilds.fetch(ServerID).catch(m => { })
        if (!guild) return;
        const category = guild.channels.cache.find((x) => x.name == "MODMAIL")
        if (!category) return;
        const main = guild.channels.cache.find((x) => x.name == message.author.id)


        if (!main) {
            let mx = await guild.channels.create(message.author.id, {
                type: "text",
                parent: category.id,
                topic: "This mail is created for helping  **" + message.author.tag + " **"
            })

            let sembed = new discord.MessageEmbed()
                .setAuthor("SUPPORT MAIL OPENED")
                .setColor("GREEN")
                .setThumbnail(client.user.displayAvatarURL())
                .setDescription("Conversation is now started, you will be contacted by cpt.motchy's staff soon")

            message.author.send(sembed)


            let eembed = new discord.MessageEmbed()
                .setAuthor("DETAILS", message.author.displayAvatarURL({ dynamic: true }))
                .setColor("BLUE")
                .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
                .setDescription(message.content)
                .addField("Name", message.author.username)
                .addField("Account Creation Date", message.author.createdAt)
               


            return mx.send(eembed)
        }

        let xembed = new discord.MessageEmbed()
            .setColor("RED")
            .setAuthor(message.author.tag, message.author.displayAvatarURL({ dynamic: true }))
            .setDescription(message.content)


        main.send(xembed)

    }




})


client.login(process.env.TOKEN)
