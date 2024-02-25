const { Client, Partials, EmbedBuilder, ApplicationCommandType, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, ChannelSelectMenuBuilder, StringSelectMenuBuilder, RoleSelectMenuBuilder, UserSelectMenuBuilder, ChannelType, REST, Routes } = require("discord.js");
const { channels, botId } = require("../utils/discordIDS");
const { writeFileSync } = require("node:fs");
const dotenv = require("dotenv");
const glob = require("glob");
const wait = require("node:timers/promises").setTimeout;

module.exports =

new class {

	constructor() {

		// File System
		/**
		 * Renvoi la variable d'environnement (.env)
         * @param {string} value - La variable d'environnement
         * @example
		 * getEnv("DISCORD_BOT_TOKEN");
         */
		this.getEnv = (value) => {

			try {

				dotenv.config();
				return process.env[value];

			}

			catch (error) {
				this.Catch.Function(error, "getEnv");
			}

		};
		/**
		 * Renvoi le chemin (path) complet du fichier cible
		 * @param {string} file - Le nom du fichier - path
		 * @param {".js"|".json"|".png"|".jpg"|".jpeg"|".gif"|".ttf"|".otf"|null} [extend] - Filtrer par extension
		 * @example
		 * getFile("ready"); // Renvoi le chemin du premier fichier "ready"
		 * getFile("bot/events/ready", ".js"); // Renvoi le chemin du fichier "bot/events/ready.js"
		 */
		this.getFile = (file, extend) => {

			try {

				const _ = process.platform === "win32" ? "\\" : "/";

				const files = extend ? this.getFilesIn(null, extend) : this.getFilesIn();

				if (files === undefined) {
					return undefined;
				}

				return files.find(f => f.includes(file.replace(/\//g, _).replace(/\\/g, _)));

			}
			catch (error) {
				this.Catch.Function(error, "getFile");
			}

		};
		/**
		 * Renvoi les chemins (path) complet des fichiers présent dans le dossier cible
		 * @param {string|null} folder - Le nom du dossier - path
		 * @param {".js"|".json"|".png"|".jpg"|".jpeg"|".gif"|".ttf"|".otf"} [extend] - Filtrer par extension
		 * @example
		 * getFilesIn("bot/events"); // Renvoi tous les chemins des fichiers présent dans le dossier "bot/events"
		 * getFilesIn("bot", ".js"); // Renvoi tous les chemins des fichiers .js présent dans le dossier "bot"
		 */
		this.getFilesIn = (folder, extend) => {

			try {

				const _ = process.platform === "win32" ? "\\" : "/";
				const base = folder ? this.getFolder(folder) : this.getFolder();

				if (base === undefined) {
					return undefined;
				}

				const files = extend ? glob.sync(`**/**/*${extend}`, { ignore:"node_modules/**" }).map(f => `${process.cwd()}${_}${f}`).filter(f => f.includes(base)) : glob.sync(`**/**/*.*`, { ignore:"node_modules/**" }).map(f => `${process.cwd()}${_}${f}`).filter(f => f.includes(base));

				return files;

			}
			catch (error) {
				this.Catch.Function(error, "getFilesIn");
			}

		};
		/**
		 * Renvoi le chemin (path) complet du dossier cible
		 * @param {string} [folder] - Le nom du dossier - path
		 * @example
		 * getFolder(); // Renvoi le chemin projet (process.cwd())
		 * getFolder("bot"); // Renvoi le chemin du dossier "bot"
		 */
		this.getFolder = (folder) => {

			try {

				const _ = process.platform === "win32" ? "\\" : "/";

				if (folder) {
					return this.getFoldersIn()?.find(f => f.includes(folder.replace(/\//g, _).replace(/\\/g, _)));
				}
				else {
					return process.cwd();
				}

			}
			catch (error) {
				this.Catch.Function(error, "getFolder");
			}

		};
		/**
		 * Renvoi tous les chemins (path) complet des dossiers présent dans le dossier cible
		 * @param {string} [folder] - Le nom du dossier - path
		 * getFoldersIn(); // Renvoi tous les chemins de chaque dossier présent dans le projet
		 * getFoldersIn("bot"); // Renvoi tous les chemins de chaque dossier présent dans le dossier "bot"
		 */
		this.getFoldersIn = (folder) => {

			try {

				const folders = glob.sync("*/**/", { ignore:"node_modules/**" });

				if (folder) {
					return folders.filter(f => f.includes(folder));
				}

				return folders;

			}
			catch (error) {
				this.Catch.Function(error, "getFoldersIn");
			}

		};

		// Client Bot Discord
		this.DiscordBot = new Client({
			allowedMentions:{
				parse:["roles", "users"],
				repliedUser:true,
				roles:[],
				users:[],
			},
			failIfNotExists:true,
			intents:[
				"AutoModerationConfiguration",
				"AutoModerationExecution",
				"DirectMessageReactions",
				"DirectMessageTyping",
				"DirectMessages",
				"GuildBans",
				"GuildEmojisAndStickers",
				"GuildIntegrations",
				"GuildInvites",
				"GuildMembers",
				"GuildMessageReactions",
				"GuildMessageTyping",
				"GuildMessages",
				"GuildModeration",
				"GuildPresences",
				"GuildScheduledEvents",
				"GuildVoiceStates",
				"GuildWebhooks",
				"Guilds",
				"MessageContent",
			],
			partials:[
				Partials.Channel,
				Partials.GuildMember,
				Partials.GuildScheduledEvent,
				Partials.Message,
				Partials.Reaction,
				Partials.ThreadMember,
				Partials.User,
			],
		});

		// Mise en route des clients
		this.Run = {

			// Mise en route du Bot Discord
			DiscordBot:async () => {

				try {

					await new REST({ version:"10" }).setToken(this.getEnv("DISCORD_BOT_TOKEN")).put(Routes.applicationCommands(botId), { body:this.getFilesIn("Bot/commands", ".js").map(command => require(command).command) });

					this.DiscordBot.setMaxListeners(0);
					this.DiscordBot.login(this.getEnv("DISCORD_BOT_TOKEN"));

				}

				catch (error) {
					console.error(error.stack ?? error.message ?? error);
				}

			},

		};

		// Gestion de la base de données (json) - (Data)
		/**
		 * Renvoi la valeur de la clé
		 * @param {string} file - Le nom du fichier - path
		 * @param {string|Object} [value] - La clé cible
		 * @example
		 * getInData("file_name", "a"); // Renvoi la valeur de a dans le fichier "Data/file_name.json" (format Objet)
		 * getInData("file_name", { a:"1" }); // Renvoi l'objet ayant pour valeur "a":"1" dans le fichier "Data/file_name.json" (format tableau)
		 */
		this.getInData = (file, value) => {

			try {

				const filePath = this.getFile(`Data/${file.replace("Data/", "")}`, ".json");

				if (filePath === undefined) {
					return undefined;
				}

				const json = require(filePath);

				if (value) {

					if (Array.isArray(json)) {

						const key = Object.keys(key)[0];

						return json.find(v => v[key] === value[key]);

					}

					else {

						if (typeof value === "object") {
							return undefined;
						}

						return json[value];

					}

				}

				else {
					return json;
				}

			}
			catch (error) {
				this.Catch.Function(error, "getInData");
			}

		};
		/**
		 * Sauvegarde le fichier
		 * @param {string} file - Le nom du fichier - path
		 * @example
		 * saveData("file_name");
		 */
		this.saveData = (file) => {

			try {

				const filePath = this.getFile(`Data/${file.replace("Data/", "")}`, ".json");

				writeFileSync(filePath ?? "", JSON.stringify(require(filePath ?? ""), null, 4));

			}
			catch (error) {
				this.Catch.Function(error, "saveData");
			}

		};
		/**
		 * Supprime une clé de la base de donnée
		 * @param {string} file - Le nom du fichier - path
		 * @param {string|Object} value - La clé a supprimer
		 * @example
		 * removeInData("file_name", "a"); // Supprime la clé "a" dans le fichier "Data/file_name.json" (format Objet)
		 * removeInData("file_name", { a:"1" }); // Supprime l'objet ayant pour valeur "a":"1" dans le fichier "Data/file_name.json" (format tableau)
		 */
		this.removeInData = (file, value) => {

			try {

				const filePath = this.getFile(`Data/${file.replace("Data/", "")}`, ".json");

				const json = require(filePath ?? "");

				if (Array.isArray(json)) {

					const key = Object.keys(value)[0];
					const index = json.findIndex(item => item[key] === value[key]);

					if (index !== -1) {

						json.splice(index, 1);
						this.saveData(file);

					}

				}

				else {

					delete json[typeof value === "object" ? "" : value];
					this.saveData(file);

				}

			}
			catch (error) {
				this.Catch.Function(error, "removeInData");
			}

		};
		/**
		 * Ajoute une donnée à la base de données
		 * @param {string} file - Le nom du fichier - path
		 * @param {string|Object} value - La donnée à ajoutée
		 * @example
		 * pushInData("file_name", "a"); // Ajoute : { "0":"a" } (format objet)
		 * pushInData("file_name", { a:"1" }); // Ajoute : { "a":"1" } (format objet)
		 * pushInData("file_name", "a"); // Ajoute : "a" (format tableau)
		 * pushIndata("file_name", { a:"1" }); // Ajoute : { "a":"1" } (format tableau)
		 */
		this.pushInData = (file, value) => {

			try {

				const filePath = this.getFile(`Data/${file.replace("Data/", "")}`, ".json");

				const json = require(filePath ?? "");

				if (Array.isArray(json)) {

					json.push(value);
					this.saveData(file);

				}

				else {

					Object.assign(json, value);
					this.saveData(file);

				}

			}
			catch (error) {
				this.Catch.Function(error, "pushInData");
			}

		};
		/**
		 * Supprime les données de tout un fichier
		 * @param {string} file - Le nom du fichier - path
		 * @example
		 * clearData("file_name"); // Supprime toutes les données du fichier "Data/file_name.json"
		 */
		this.clearData = (file) => {

			try {

				const filePath = this.getFile(`Data/${file.replace("Data/", "")}`, ".json");

				const json = require(filePath ?? "");

				Array.isArray(json) ? json.splice(0, json.length) : Object.keys(json).forEach(k => delete json[k]);

				this.saveData(file);

			}
			catch (error) {
				this.Catch.Function(error, "clearData");
			}

		};

		// Appels
		this.Call = {

			/**
			 * Appel des evenements Discord
			 */
			discordEvents:() => {

				try {

					const files = this.getFilesIn("Bot/events", ".js");

					for (const file of files ?? []) {

						const event = require(file);
						const _ = event.name === "ready" ? "once" : "on";

						this.DiscordBot[_](event.name, (...args) => event.run(...args));

					}

				}
				catch (error) {
					this.Catch.Function(error, "Call.discordEvents");
				}

			},
			/**
			 * Appel des commandes Discord
			 * @param {import("discord.js").CommandInteraction} listener
             * @param {boolean} [autocomplete]
			 */
			discordCommands:async (listener, autocomplete) => {

				try {

					const files = this.getFilesIn("Bot/commands", ".js");

					if (!autocomplete) {

						for (const file of files ?? []) {

							const command = require(file);

							if (command.command.name === listener.commandName) {
								command.run(listener);
							}

						}

					}

					else {

						const file = files.map(f => require(f)).find(f => f.command && f.command.name === listener.commandName);

						if (!file || !file.autocomplete) { return; }

						if (typeof file.autocomplete === "function") { await file.autocomplete(listener); }

						if (typeof file.autocomplete === "object") {

							const focus = listener.options.getFocused().toLowerCase();
							const focus_name = listener.options.getFocused(true).name;

							const values = file.autocomplete.find(option => option.option === focus_name).values;

							if (!focus) {
								return await listener.respond(values.map(x => ({ name:x, value:x })).slice(0, 25));
							}

							const filtre = values.filter(x => x.toLocaleLowerCase().includes(focus));

							await listener.respond(filtre.map(x => ({ name:x, value:x })).slice(0, 25));

						}

					}

				}
				catch (error) {
					this.Catch.Function(error, `Call.discordCommands(${autocomplete ? "autocomplete" : "false"})`);
				}

			},
			/**
			 * Appel des composants Discord
			* @param {import("discord.js").ButtonInteraction|import("discord.js").ModalSubmitInteraction|import("discord.js").AnySelectMenuInteraction} listener
			*/
			discordComponents:(listener) => {

				try {

					const buttons_files = this.getFilesIn("Bot/components/buttons", ".js");
					const modals_files = this.getFilesIn("Bot/components/modals", ".js");
					const selectMenus_files = this.getFilesIn("Bot/components/selectMenus", ".js");

					for (const file of listener.isButton() ? buttons_files ?? [] : listener.isModalSubmit() ? modals_files ?? [] : selectMenus_files ?? []) {
						const component = require(file);
						if (component.customId === listener.customId) {
							component.run(listener);
						}
					}

				}
				catch (error) {
					this.Catch.Function(error, "Call.discordComponents");
				}

			},

		};

		// Capture des erreurs
		// Chaque erreur sera renvoyée dans le salon des erreurs Discord s'il est défini (utils/discordIDS.js)
		this.Catch = {

			/**
			 * Capture des erreurs de process - non capturées
			 */
			process:() => {

				process.on("uncaughtException", async error => {

					try {

						console.error(error.stack ?? error.message ?? error);

						if (this.DiscordBot.isReady() && this.DiscordBot.channels.cache.get(channels.errors)) {

							const embed_debug = new EmbedBuilder()
								.setColor("DarkRed")
								.setTitle("Process - uncaughtException")
								.setDescription(`* ⏱ ${this.Unixify()}`)
								.addFields(
									{ name:"__Erreur__", value:`\`\`\`ansi
\u001b[0;31m${error.name}\u001b[0m
\u001b[0;30m${error.message.trim().replace(new RegExp(process.cwd(), 'g'), '')}\u001b[0m
\`\`\`` },
								)
								.setTimestamp();

							const buttons = new this.DiscordButtons([
								{ customId: "view_stack", label: "Voir la stack", style:"blue" },
								{ customId: "fix_error", label: "Résoudre", style:"green" },
							]);

							await this.DiscordBot.channels.cache.get(channels.errors).send({ embeds:[embed_debug], components:[buttons] }).then(async message => {
								this.pushInData("errors", {
									message_id:message.id,
									stack:error.stack ?? error.message ?? error,
								});
							});

						}

					}
					catch (e) {
						console.error(e);
					}

				});
				process.on("unhandledRejection", async (error) => {

					try {

						console.error(error.stack ?? error.message ?? error);

						if (this.DiscordBot.isReady() && this.DiscordBot.channels.cache.get(channels.errors)) {

							const embed_debug = new EmbedBuilder()
								.setColor("DarkRed")
								.setTitle("Process - unhandledRejection")
								.setDescription(`* ⏱ ${this.Unixify()}`)
								.addFields(
									{ name:"__Erreur__", value:`\`\`\`ansi
\u001b[0;31m${error.name}\u001b[0m
\u001b[0;30m${error.message.trim().replace(new RegExp(process.cwd(), 'g'), '')}\u001b[0m
\`\`\`` },
								)
								.setTimestamp();

							const buttons = new this.DiscordButtons([
								{ customId:"view_stack", label:"Voir la stack", style:"blue" },
								{ customId:"fix_error", label:"Résoudre", style:"green" },
							]);

							await this.DiscordBot.channels.cache.get(channels.errors).send({ embeds:[embed_debug], components:[buttons] }).then(async message => {
								this.pushInData("errors", {
									message_id:message.id,
									stack:error.stack ?? error.message ?? error,
								});
							});

						}

					}
					catch (e) {
						console.error(e);
					}

				});
				process.on("exit", code => {

					console.log(`Le processus s'est arrêter avec le code ${code}`);

				});

			},
			/**
			 * Capture des erreurs liées à une fonction
			 * @param {Error} error - Erreur
			 * @param {string} functionName - Nom de la fonction
			 * @example
			 * try {
			 * 	// do stuff
			 * }
			 * catch (error) {
			 * 	Catch.Function(error, "Nom de la fonction");
			 * }
			 */
			Function:async (error, functionName) => {

				try {

					console.error(error.stack ?? error.message ?? error);

					if (this.DiscordBot.isReady() && this.DiscordBot.channels.cache.get(channels.errors)) {

						const embed_debug = new EmbedBuilder()
							.setColor("DarkRed")
							.setTitle(`Function - ${functionName}`)
							.setDescription(`* ⏱ ${this.Unixify()}`)
							.addFields({
								name: "__Erreur__",
								value: `\`\`\`ansi
\u001b[0;31m${error.name}\u001b[0m
\u001b[0;30m${error.message.trim().replace(new RegExp(process.cwd(), 'g'), '')}\u001b[0m
\`\`\``,
							})
							.setTimestamp();

						const buttons = new this.DiscordButtons([
							{ customId:"view_stack", label:"Voir la stack", style:"blue" },
							{ customId:"fix_error", label:"Résoudre", style:"green" },
						]);

						await this.DiscordBot.channels.cache.get(channels.errors).send({ embeds:[embed_debug], components:[buttons] }).then(async message => {
							this.pushInData("errors", {
								message_id:message.id,
								stack:error.stack ?? error.message ?? error,
							});
						});

					}

				}

				catch (e) {
					console.error(e);
				}

			},
			/**
			 * Capture des erreurs liées à une commande Discord
			 * @param {Error} error - Erreur
			 * @param {import("discord.js").CommandInteraction} listener - interaction
			 * @example
			 * try {
			 * 	// do stuff
			 * }
			 * catch (error) {
			 * 	Catch.DiscordCommand(error, interaction);
			 * }
			 */
			DiscordCommand:async (error, listener) => {

				try {

					console.error(error.stack ?? error.message ?? error);

					if (this.DiscordBot.isReady() && this.DiscordBot.channels.cache.get(channels.errors)) {

						const embed_reply = new EmbedBuilder()
							.setColor("DarkRed")
							.setDescription(`😖 **Il semblerait qu'il y ait une erreur.**
\`\`\`ansi
\u001b[0;31m${error.name}\u001b[0m
\u001b[0;30m${error.message.trim().replace(new RegExp(process.cwd(), 'g'), '')}\u001b[0m
\`\`\``);

						const embed_debug = new EmbedBuilder()
							.setTitle(`Discord - Commands`)
							.setAuthor({ name:listener.member.displayName, iconURL:listener.member.displayAvatarURL() })
							.setColor("DarkRed")
							.setDescription(`* ⏱ ${this.Unixify()}
* **Commande** ${listener.commandType === ApplicationCommandType.ChatInput ? `{/} : </${listener.commandName}:${listener.commandId}>` : `{contextMenu} : ${listener.commandName}`} (\`${listener.commandId}\`)
* **Utilisateur** : <@${listener.user.id}> (\`${listener.user.id}\`)
* **Serveur** : ${listener.guild.name} (\`${listener.guild.id})\``)
							.addFields({
								name: "__Erreur__",
								value: `\`\`\`ansi
\u001b[0;31m${error.name}\u001b[0m
\u001b[0;30m${error.message.trim().replace(new RegExp(process.cwd(), 'g'), '')}\u001b[0m
\`\`\``,
							})
							.setTimestamp();


						if (listener.replied) {
							await listener.followUp({ embeds:[embed_reply], ephemeral:true });
						}
						if (listener.deferred) {
							await listener.followUp({ embeds:[embed_reply], ephemeral:true });
						}
						else {
							await listener.reply({ embeds:[embed_reply], ephemeral:true });
						}

						const buttons = new this.DiscordButtons([
							{ customId:"view_stack", label:"Voir la stack", style:"blue" },
							{ customId:"fix_error", label:"Résoudre", style:"green" },
						]);

						await this.DiscordBot.channels.cache.get(channels.errors).send({ embeds:[embed_debug], components:[buttons] }).then(async message => {
							this.pushInData("errors", {
								message_id:message.id,
								stack:error.stack ?? error.message ?? error,
							});
						});

					}

				}

				catch (e) {
					console.error(e);
				}

			},
			/**
			 * Capture des erreurs liées à un composant Discord (button, selectMenu, Modal)
			 * @param {Error} error - Erreur
			 * @param {import("discord.js").ButtonInteraction|import("discord.js").AnySelectMenuInteraction|import("discord.js").ModalSubmitInteraction} listener - interaction
			 * try {
			 * 	// do stuff
			 * }
			 * catch (error) {
			 * 	Catch.DiscordComponent(error, interaction);
			 * }
			 */
			DiscordComponent:async (error, listener) => {

				try {

					console.error(error.stack ?? error.message ?? error);

					if (this.DiscordBot.isReady() && this.DiscordBot.channels.cache.get(channels.errors)) {

						const embed_reply = new EmbedBuilder()
							.setColor("DarkRed")
							.setDescription(`😖 **Il semblerait qu'il y ait une erreur.**
\`\`\`ansi
\u001b[0;31m${error.name}\u001b[0m
\u001b[0;30m${error.message.trim().replace(new RegExp(process.cwd(), 'g'), '')}\u001b[0m
\`\`\``);

						const embed_debug = new EmbedBuilder()
							.setTitle(`Discord - Components`)
							.setAuthor({ name:listener.member.displayName, iconURL:listener.member.displayAvatarURL() })
							.setColor("DarkRed")
							.setDescription(`* ⏱ ${this.Unixify()}
* **${listener.isButton() ? "Bouton" : listener.isAnySelectMenu() ? "SelectMenu" : "Modal"}** : ${listener.customId}
* **Utilisateur** : <@${listener.user.id}> (\`${listener.user.id}\`)
* **Serveur** : ${listener.guild.name} (\`${listener.guild.id})\``)
							.addFields({
								name: "__Erreur__",
								value: `\`\`\`ansi
\u001b[0;31m${error.name}\u001b[0m
\u001b[0;30m${error.message.trim().replace(new RegExp(process.cwd(), 'g'), '')}\u001b[0m
\`\`\``,
							})
							.setTimestamp();

						if (listener.replied) {
							await listener.followUp({ embeds:[embed_reply], ephemeral:true });
						}
						if (listener.deferred) {
							await listener.followUp({ embeds:[embed_reply], ephemeral:true });
						}
						else {
							await listener.reply({ embeds:[embed_reply], ephemeral:true });
						}

						const buttons = new this.DiscordButtons([
							{ customId:"view_stack", label:"Voir la stack", style:"blue" },
							{ customId:"fix_error", label:"Résoudre", style:"green" },
						]);

						await this.DiscordBot.channels.cache.get(channels.errors).send({ embeds:[embed_debug], components:[buttons] }).then(async message => {
							this.pushInData("errors", {
								message_id:message.id,
								stack:error.stack ?? error.message ?? error,
							});
						});

					}

				}

				catch (e) {
					console.error(e);
				}

			},
			/**
			 * Capture des erreurs liées à un evenement Discord
			 * @param {Error} error - Erreur
			 * @param {string} eventName - Nom de l'evenement
			 * @example
			 * try {
			 * 	// do stuff
			 * }
			 * catch (error) {
			 * 	Catch.DiscordEvent(error, "Nom de l'evenement");
			 * }
			 */
			DiscordEvent:async (error, eventName) => {

				try {

					console.error(error.stack ?? error.message ?? error);

					if (this.DiscordBot.isReady() && this.DiscordBot.channels.cache.get(channels.errors)) {

						const embed_debug = new EmbedBuilder()
							.setColor("DarkRed")
							.setTitle(`discord - Event - ${eventName}`)
							.setDescription(`* ⏱ ${this.Unixify()}`)
							.addFields({
								name: "__Erreur__",
								value: `\`\`\`ansi
\u001b[0;31m${error.name}\u001b[0m
\u001b[0;30m${error.message.trim().replace(new RegExp(process.cwd(), 'g'), '')}\u001b[0m
\`\`\``,
							})
							.setTimestamp();

						const buttons = new this.DiscordButtons([
							{ customId:"view_stack", label:"Voir la stack", style:"blue" },
							{ customId:"fix_error", label:"Résoudre", style:"green" },
						]);

						await this.DiscordBot.channels.cache.get(channels.errors).send({ embeds:[embed_debug], components:[buttons] }).then(async message => {
							this.pushInData("errors", {
								message_id:message.id,
								stack:error.stack ?? error.message ?? error,
							});
						});

					}

				}

				catch (e) {
					console.error(e);
				}

			},

		};

		// Templates - Buttons, selectMenu, Modal
		this.DiscordButtons = class Buttons {

			/**
			* @param {Array<{
			* customId:string,
			* label:string,
			* style:"blue"|"green"|"red"|"grey"|"link",
			* disabled?:boolean,
			* emoji?:import("discord.js").ComponentEmojiResolvable,
			* url?:string,
			* }>} buttons
			* @example
			* new DiscordButtons([
				{
					customId:"button-test",
					label:"test",
					style:"blue",
				},
			]);
			*/
			constructor(buttons) {

				const builder = new ActionRowBuilder();

				for (const button of buttons) {

					const component = new ButtonBuilder()
						.setLabel(button.label)
						.setStyle(button.style === "blue" ? ButtonStyle.Primary : button.style === "green" ? ButtonStyle.Success : button.style === "grey" ? ButtonStyle.Secondary : button.style === "link" ? ButtonStyle.Link : ButtonStyle.Danger);

					if (!button.url) {
						component.setCustomId(button.customId);
					}
					if (button.disabled) {
						component.setDisabled(button.disabled);
					}
					if (button.emoji) {
						component.setEmoji(button.emoji);
					}
					if (button.url) {
						component.setURL(button.url);
					}

					builder
						.addComponents(component);

				}

				return builder;

			}

		};
		this.DiscordModal = class Modal {

			/**
			* @param {{
			* customId:string,
			* title:string,
			* texts:Array<{
			* customId:string,
			* label:string,
			* style:"short"|"paragraph",
			* min_length?:number,
			* max_length?:number,
			* placeholder?:string,
			* required?:boolean,
			* }>
			* }} modal
			* @example
			* new DiscordModal({
				customId:"modal-test",
				title:"Modal",
				texts:[
					{
						customId:"input",
						label:"Input",
						style:"short",
					},
				]
			});
			*/
			constructor(modal) {

				const builder = new ModalBuilder()
					.setCustomId(modal.customId)
					.setTitle(modal.title);

				for (const text of modal.texts) {

					const component = new TextInputBuilder()
						.setCustomId(text.customId)
						.setLabel(text.label)
						.setStyle(text.style === "paragraph" ? TextInputStyle.Paragraph : TextInputStyle.Short)
						.setRequired(text.required || false);

					if (text.min_length) {
						component.setMinLength(text.min_length);
					}
					if (text.max_length) {
						component.setMaxLength(text.max_length);
					}
					if (text.placeholder) {
						component.setPlaceholder(text.placeholder);
					}

					builder.addComponents(new ActionRowBuilder().addComponents(component));

				}

				return builder;

			}

		};
		this.DiscordSelectMenu = class selectMenu {

			/**
			* @param {{
			* type:"string"|"channel"|"role"|"user",
			* customId:string,
			* options?:Array<{
			* label:string,
			* value:string,
			* emoji?:string,
			* default?:boolean,
			* }>,
			* min_value?:number,
			* max_value?:number,
			* placeholder?:string,
			* channelTypes?:Array<
			* "AnnouncementThread"|"DM"|"GroupDM"|"GuildAnnouncement"|"GuildCategory"|"GuildDirectory"|"GuildForum"|"GuildStageVoice"|"GuildText"|"GuildVoice"|"PrivateThread"|"PublicThread"
			* >,
			* disabled?:boolean
			* }} selectMenu
			* @example
			* new DiscordSelectMenu({
				customId:"selectMenu-test",
				type:"string",
				options:[
					{
						label:"Sélection 1",
						value:"select-1",
					},
					{
						label:"Sélection 2",
						value:"select-2",
					},
				],
			});
			*/
			// eslint-disable-next-line no-shadow
			constructor(selectMenu) {

				const builder = new ActionRowBuilder();

				const component = selectMenu.type === "channel" ? new ChannelSelectMenuBuilder() : selectMenu.type === "string" ? new StringSelectMenuBuilder() : selectMenu.type === "role" ? new RoleSelectMenuBuilder() : new UserSelectMenuBuilder();
				component.setCustomId(selectMenu.customId)
					.setDisabled(selectMenu.disabled || false);

				if (selectMenu.channelTypes && component instanceof ChannelSelectMenuBuilder) {
					component.addChannelTypes(selectMenu.channelTypes.map(type =>
						type === "AnnouncementThread" ? ChannelType.AnnouncementThread :
							type === "DM" ? ChannelType.DM :
								type === "GroupDM" ? ChannelType.GroupDM :
									type === "GuildAnnouncement" ? ChannelType.GuildAnnouncement :
										type === "GuildCategory" ? ChannelType.GuildCategory :
											type === "GuildDirectory" ? ChannelType.GuildCategory :
												type === "GuildForum" ? ChannelType.GuildForum :
													type === "GuildStageVoice" ? ChannelType.GuildStageVoice :
														type === "GuildText" ? ChannelType.GuildText :
															type === "GuildVoice" ? ChannelType.GuildVoice :
																type === "PrivateThread" ? ChannelType.PrivateThread :
																	ChannelType.PublicThread,
					));
				}
				if (selectMenu.min_value) {
					component.setMinValues(selectMenu.min_value);
				}
				if (selectMenu.max_value) {
					component.setMaxValues(selectMenu.max_value);
				}
				if (selectMenu.placeholder) {
					component.setPlaceholder(selectMenu.placeholder);
				}

				if (selectMenu.options) {
					selectMenu.options.forEach(option => {
						if (option.emoji && !(component instanceof ChannelSelectMenuBuilder) && !(component instanceof RoleSelectMenuBuilder) && !(component instanceof UserSelectMenuBuilder)) {
							component.addOptions(
								{ label:option.label, value:option.value, emoji:option.emoji, default:option.default ?? false },
							);
						}
						else {
							if (!(component instanceof ChannelSelectMenuBuilder) && !(component instanceof RoleSelectMenuBuilder) && !(component instanceof UserSelectMenuBuilder)) {
								component.addOptions(
									{ label:option.label, value:option.value, default:option.default ?? false },
								);
							}
						}
					});
				}

				builder.addComponents(component);

				return builder;

			}

		};

		// Utils
		/**
		 * Renvoi une date au format unix timestamp pour Discord
		 * @param {number|null} [timestamp]
		 * @param {"Default"|"Short Time"|"Long Time"|"Short Date"|"Long Date"|"Short Date/Time"|"Long Date/Time"|"Relative"} [format]
		 * @example
		 * Unixify(new Date().getTime(), "Relative");
		 */
		this.Unixify = (timestamp, format) => {

			if (format) {
				if (format === "Default") { format = ">"; }
				if (format === "Long Date") { format = ":D>"; }
				if (format === "Long Date/Time") { format = ":F>"; }
				if (format === "Long Time") { format = ":T>"; }
				if (format === "Relative") { format = ":R>"; }
				if (format === "Short Date") { format = ":d>"; }
				if (format === "Short Date/Time") { format = ":f>"; }
				if (format === "Short Time") { format = ":t>"; }
			}

			return `<t:${Math.floor(timestamp ? timestamp / 1000 : new Date().getTime() / 1000)}${format ?? ">"}`;

		};
		/**
		 * Met en attente
		 * @param {number} time - Temps d'attente (milisecondes)
		 * @example
		 * await wait(60000 * 5); // Met en attente 5 minutes
		 */
		this.wait = async (time) => {

			return await wait(time);

		};

	}

};
