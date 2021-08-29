import { logger } from '@/startup';
import { Command } from '@internals/commandhandler';
import { config, writeConfig } from '@utils/config';
import { chat, getCommandWhitelist, isWhitelisted } from '@utils/helpers';
import { ChatUserstate } from 'tmi.js';

const commandRegex = new RegExp(/^([a-z]+) (add|remove|list)? ?([a-z\d]+)?$/i);

export const command: Command = {
    name: 'whitelist',
    description: 'Whitelists a user to a specified command.',
    modRequired: false,
    usage: 'whitelist <command> <add|remove|list> [user]',
    aliases: ['wl'],
    async execute(channel: string, sender: ChatUserstate, args: string | undefined): Promise<void> {
        if (!isWhitelisted(sender, this.name)) {
            chat(channel, 'You are not whitelisted for this command!');
            return;
        }
        if (!args) {
            chat(channel, `Missing required arguments! Try ${config.general.prefix}help ${this.name}`);
            return;
        }

        const [, command, action, user] = args.match(commandRegex) || [];
        if (!command) {
            chat(channel, `Arguments are invalid! Try ${config.general.prefix}help ${this.name}`);
            return;
        }
        if (!action) {
            chat(channel, 'The action you specified is invalid! Validactions are: add, remove & list');
            return;
        }
        if (action !== 'list' && !user) {
            chat(channel, 'Please specify a user!');
            return;
        }

        let index: number;
        const whitelist = getCommandWhitelist(command);
        if (!config.commands) config.commands = {};
        if (!config.commands[command]) config.commands[command] = {};
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        if (!config.commands[command]!.whitelist) config.commands[command]!.whitelist = [];

        switch (action.toLowerCase()) {
            case 'add':
                if (!user) return;
                if (isWhitelisted(user, command, whitelist)) {
                    chat(channel, `${user} is already whitelisted!`);
                    return;
                }
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                config.commands[command]!.whitelist!.push(user);
                await writeConfig();
                chat(channel, `${user} was added to the ${command} whitelist!`);
                logger.command(`>${this.name} | ${user} was added to the ${command} whitelist!`);
                break;
            case 'remove':
                if (!user) return;
                index = whitelist.indexOf(user);
                if (index === -1) {
                    chat(channel, `${user} is not whitelisted!`);
                    return;
                }
                whitelist.splice(index, 1);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                config.commands[command]!.whitelist! = whitelist;
                await writeConfig();
                chat(channel, `${user} was removed from the ${command} whitelist!`);
                logger.command(`>${this.name} | ${user} was removed from the ${command} whitelist!`);
                break;
            case 'list':
                chat(channel, `${command} whitelist: ${whitelist.join(', ')}`);
                break;
            default:
                chat(channel, `Invalid action! Try ${config.general.prefix}help ${this.name}`);
                return;
        }
    }
};
