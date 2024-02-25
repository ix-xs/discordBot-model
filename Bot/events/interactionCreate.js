const Client = require("../../Client/Client");

module.exports =

{

	name:"interactionCreate",

	/**
	 * @param {import("discord.js").Interaction} interaction
	 */
	async run(interaction) {

		try {

			if (interaction.isChatInputCommand() || interaction.isContextMenuCommand()) {
				Client.Call.discordCommands(interaction);
			}
			if (interaction.isButton() || interaction.isAnySelectMenu() || interaction.isModalSubmit()) {
				Client.Call.discordComponents(interaction);
			}
			if (interaction.isAutocomplete()) {
				Client.Call.discordCommands(interaction, true);
			}

		}

		catch (error) {
			Client.Catch.DiscordEvent(error, "interactionCreate");
		}

	},

};
