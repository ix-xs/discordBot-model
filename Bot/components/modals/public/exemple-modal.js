const Client = require("../../../../Client/Client");

module.exports =

{

	customId:"exemple-modal",

	/**
     * @param {import("discord.js").ModalSubmitInteraction} modal
     */
	async run(modal) {

		try {

			const response = await modal.deferReply({ ephemeral:true });
			const input_text = modal.fields.getTextInputValue("input-text");

			await response.edit({ content:`* Input : ${input_text}` });

		}

		catch (error) {
			Client.Catch.DiscordComponent(error, modal);
		}

	},

};
