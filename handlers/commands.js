const { Perms } = require('../validation/permissions');
const { client } = require('discord.js');
const { promisify } = require('util');
const { glob } = require('glob');
const PG = promisify(glob);
const Ascii = require('ascii-table');
/** 
 * @param {client} client
*/
module.exports = async (client) => {
	const table = new Ascii('command loaded');

	commandsArray = [];
	(await PG(`${process.cwd()}/commands/*/*.js`)).map(async (file) => {
		const command = require(file);

		if (!command.name) return table.addRow(file.split('/')[7], '🔸 FAILED', 'Missing a name.');

		if (!command.description) return table.addRow(command.name, '🔸 FAILED', 'Missing a description.');

		if (command.permission) {
			if (Perms.includes(command.permission)) command.defaultPermission = false;
			else return table.addRow(command.name, '🔸 FAILED', 'Permission is invalid.');
		}

		client.commands.set(command.name, command);
		commandsArray.push(command);

		await table.addRow(command.name, '🔹 SUCCESFUL');
	});

	console.log(table.toString());

	//persmissions check //

	client.on('ready', async () => {
		const MainGuild = await client.guilds.cache.get('857729547985879081');

		MainGuild.commands.set(commandsArray).then(async (command) => {
			const Roles = (commandName) => {
				const cmdPerms = commandsArray.find((c) => c.name === commandName).permission;
				if (!cmdPerms) return null;

				return MainGuild.roles.cache.filter((r) => r.permissions.has(cmdPerms));
			};

			const help = command.reduce((accumulator, r) => {
				const roles = Roles(r.name);
				if (!roles) return accumulator;

				const permissions = roles.reduce((a, r) => {
					return [ ...a, { id: r.id, type: 'ROLE', permission: true } ];
				});
				[];
				return [ ...accumulator, { id: r.id, permissions } ];
			});
			[];

			await MainGuild.commands.permissions.set({ help });
		});
	});
};
