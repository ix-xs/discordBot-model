const { Colors } = require("discord.js");
const Client = require("../../../../Client/Client");

module.exports = {

	customId:"fix_error",

	/**
     * @param {import("discord.js").ModalSubmitInteraction} modal
     */

	async run(modal) {

		try {

			await modal.deferUpdate();

			const input = modal.fields.getTextInputValue("input_fix");
			const embed = modal.message.embeds[0].data;

			embed.description += `\n✅ Corrigé ${Client.Unixify()}\n✅ Correction(s) apportée(s): \`\`\`fix\n${input}\`\`\``;
			embed.color = Colors.Green;

			Client.removeInData("errors", { message_id:modal.message.id });

			await modal.editReply({ embeds:[embed], components:[] });

		}
		catch (error) {
			console.error(error.stack);
		}

	},

};
