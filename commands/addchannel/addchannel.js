const { PermissionsBitField,ChannelType,SlashCommandBuilder } = require('discord.js');
const db = require('../../db/database.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('addchannel')
        .addChannelOption(option => option.setName('channel')
    .setDescription('channel to add')
    .addChannelTypes(ChannelType.GuildText)
    .setRequired(true))
        .setDescription('Add channel to be managed by the bot'),
    async execute(interaction) {
        // Check for "Manage Channels" permission
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
            await interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
            return;
        }

        const channel = interaction.options.getChannel('channel');
        const guildId = interaction.guildId;

        // Add channel to the database
        await db.addChannel(guildId, channel.id);
        await interaction.reply({ content: `Channel <#${channel.id}> has been added to the managed list.` });
    },
};
