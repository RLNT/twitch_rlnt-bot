import { Command, getCommandByName, getLoadedCommands } from '@internals/commandhandler.js';
import { config } from '@utils/config.js';
import { chat } from '@utils/helpers.js';
import { ChatUserstate } from 'tmi.js';

export const command: Command = {
    name: 'help',
    description: 'Gives further information about specific commands.',
    usage: 'help [command]',
    aliases: ['commands', 'cmds'],
    async execute(channel: string, _sender: ChatUserstate, argument: string | undefined): Promise<void> {
        const loadedCommands = getLoadedCommands();

        if (!argument) {
            chat(channel, [
                'In order to get help for a specific command, please follow ',
                `the format ${config.general.prefix}help <command>! `,
                `Currently loaded commands: ${loadedCommands.join(', ')}`
            ]);
            return;
        }

        const command = getCommandByName(argument);
        if (!loadedCommands.includes(argument) || !command) {
            chat(channel, [`You entered an invalid command! Currently loaded commands: ${loadedCommands.join(', ')}`]);
            return;
        }

        const aliases = command.aliases?.join(', ') || 'None';
        const cooldown = command.cooldown || 3;
        let message = `${command.name}-command: ${command.description}`;
        if (command.usage) message += ` | Usage: ${command.usage}`;
        message += ` | Aliases: ${aliases} | Cooldown: ${cooldown}s`;
        chat(channel, message);
    }
};
