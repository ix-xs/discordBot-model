const { Run, Catch, Call } = require("./Client/Client");

// Capture des erreurs de process - non capturées
Catch.process();

// Appel des evenements Discord
Call.discordEvents();

// Mise en route du Bot Discord
Run.DiscordBot();
