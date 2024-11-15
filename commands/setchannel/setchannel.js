const { ChannelType,SlashCommandBuilder } = require('discord.js');
const db = require('../../db/database.js');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('setchannel')
    .addChannelOption(option => option.setName('channel')
.setDescription('channel to switch to')
.addChannelTypes(ChannelType.GuildText)
.setRequired(true))
    .setDescription('Change your active channel'),
    async execute(interaction) {
        const channel = interaction.options.getChannel('channel');
        const guildId = interaction.guildId;
        const userId = interaction.user.id;

        // Check if the channel is managed
        const isManaged = await db.isChannelManaged(guildId, channel.id);
        if (!isManaged) {
            await interaction.reply({ content: 'This channel is not managed by the bot.', ephemeral: true });
            return;
        }
        
        // Remove access from the previous channel if it exists
        const previousChannelId = await db.getUserChannel(guildId, userId);
        if (previousChannelId) {
            const previousChannel = interaction.guild.channels.cache.get(previousChannelId);
            if (previousChannel) {
                await previousChannel.permissionOverwrites.edit(interaction.member, { ViewChannel: false, SendMessages: false });
            }
        }

        // Grant access to the selected channel
        await channel.permissionOverwrites.edit(interaction.member, { ViewChannel: true, SendMessages: true });
        await db.setUserChannel(guildId, userId, channel.id);

        await interaction.reply({ content: `You now have access to <#${channel.id}>.` });
    },
};
