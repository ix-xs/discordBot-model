const Client = require("../../../../Client/Client");

module.exports =

{

	customId:"exemple-modal",

	/**
     * @param {import("discord.js").ButtonInteraction} button
     */
	async run(button) {

		try {

			const modal = new Client.DiscordModal({
				customId:"exemple-modal",
				title:"Modal",
				texts:[
					{
						customId:"input-text",
						style:"short",
						label:"Input",
						placeholder:"Bla bla bla",
						min_length:2,
						required:true,
					},
				],
			});

			await button.showModal(modal);

		}


		catch (error) {
			Client.Catch.DiscordComponent(error, button);
		}

	},

};
