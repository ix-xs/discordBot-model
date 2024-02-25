const { EmbedBuilder } = require("discord.js");
const Client = require("../../../../Client/Client");

module.exports = {

	customId:"view_stack",

	async run(button) {

		try {

			const error = Client.getInData("errors", { message_id:button.message.id });

			if (!error) {
				return await button.reply({ content:`❌ Cette stack à été résolue et/ou supprimée de la base de données.`, ephemeral:true });
			}

			const embed = new EmbedBuilder()
				.setColor("DarkButNotBlack")
				.setDescription(error.stack);

			await button.reply({ embeds:[embed], ephemeral:true });

		}
		catch (error) {
			console.error(error.stack);
		}

	},

};
