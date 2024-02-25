const { SlashCommandBuilder, ChannelType } = require("discord.js");
const Client = require("../../../Client/Client");

module.exports =

{

	command:new SlashCommandBuilder()
		.setDMPermission(false)
		.setName("exemple")
		.setDescription("Exemple de commande slash")
		.addStringOption(
			option_text => option_text
				.setName("option-text")
				.setDescription("Option text")
				.setRequired(true),
		)
		.addStringOption(
			option_autocomplete => option_autocomplete
				.setName("option-autocomplete")
				.setDescription("Option autocomplete")
				.setRequired(true)
				.setAutocomplete(true),
		)
		.addChannelOption(
			option_salon => option_salon
				.setName("option-salon")
				.setDescription("Option salon")
				.setRequired(true)
				.addChannelTypes(ChannelType.GuildText),
		)
		.addRoleOption(
			option_role => option_role
				.setName("option-role")
				.setDescription("Option role")
				.setRequired(true),
		),

	autocomplete:[
		{
			option:"option-autocomplete",
			values:["Valeur 1", "Valeur 2", "Valeur 3", "Valeur 4", "Valeur 5"],
		},
	],

	/**
     * @param {import("discord.js").ChatInputCommandInteraction} command
     */
	async run(command) {

		try {

			const response = await command.deferReply({ ephemeral:true });

			const option_text = command.options.getString("option-text");
			const option_autocomplete = command.options.getString("option-autocomplete");
			const option_salon = command.options.getChannel("option-salon");
			const option_role = command.options.getRole("option-role");

			const buttons = new Client.DiscordButtons([
				{
					customId:"exemple-coucou",
					style:"green",
					label:"Coucou!",
					emoji:"👋",
				},
				{
					customId:"exemple-modal",
					style:"blue",
					label:"Modal",
				},
			]);

			await response.edit({ content:`* Text : ${option_text}\n* Autocomplete : ${option_autocomplete}\n* Salon : ${option_salon}\n* Role : ${option_role}`, components:[buttons] });

		}

		catch (error) {
			Client.Catch.DiscordCommand(error, command);
		}

	},

};
