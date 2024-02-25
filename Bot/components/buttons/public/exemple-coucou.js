const Client = require("../../../../Client/Client");

module.exports =

{

	customId:"exemple-coucou",

	/**
     * @param {import("discord.js").ButtonInteraction} button
     */
	async run(button) {

		try {

			const response = await button.deferReply({ ephemeral:true });

			await response.edit({ content:"Coucou!" });

		}


		catch (error) {
			Client.Catch.DiscordComponent(error, button);
		}

	},

};
