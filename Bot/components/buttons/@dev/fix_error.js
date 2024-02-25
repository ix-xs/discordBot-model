const Client = require("../../../../Client/Client");

module.exports =

{

	customId:"fix_error",

	/**
     * @param {import("discord.js").ButtonInteraction} button
     */
	async run(button) {

		try {

			const error = Client.getInData("errors", { message_id:button.message.id });

			if (!error) {
				return await button.reply({ content:`❌ Cette erreur à été résolue et/ou supprimée de la base de données.`, ephemeral:true });
			}

			const modal = new Client.DiscordModal({
				customId:"fix_error",
				title:"Fix error",
				texts:[
					{
						customId:"input_fix",
						label:"Correction(s) apportée(s)",
						required:true,
						style:"paragraph",
					},
				],
			});

			await button.showModal(modal);

		}
		catch (error) {
			console.error(error.stack);
		}

	},

};
