import { logger } from '@/startup';
import { client } from '@internals/clienthandler';
import { Command } from '@internals/commandhandler';
import { config } from '@utils/config';
import { chat, isInChannel, isWhitelisted } from '@utils/helpers';
import { ChatUserstate } from 'tmi.js';

export const command: Command = {
    name: 'exec',
    description: 'Executes a message as the bot.',
    modRequired: true,
    usage: 'exec [#channel] [/]<message>',
    aliases: ['run'],
    async execute(channel: string, sender: ChatUserstate, args: string | undefined): Promise<void> {
        if (!isWhitelisted(sender, this.name)) {
            chat(channel, 'You are not whitelisted for this command!');
            return;
        }
        if (!args) {
            chat(channel, `Missing arguments! Try ${config.general.prefix}help ${this.name}`);
            return;
        }

        let targetChannel: string;
        if (args.startsWith('#')) {
            const whitespace = args.indexOf(' ');
            targetChannel = args.slice(0, whitespace);
            if (!isInChannel(targetChannel)) {
                chat(channel, `I am not in channel ${targetChannel.slice(1)}!`);
                return;
            }
            args = args.slice(whitespace + 1);
        } else {
            targetChannel = channel;
        }
        if (!args.startsWith('/')) args = `/${args}`;

        client
            .say(targetChannel, args)
            .then(() => {
                if (targetChannel !== channel) chat(channel, 'Successfully executed!');
                let logMessage = `>${this.name} | Message was executed!`;
                if (targetChannel) logMessage += ` | Target channel: ${targetChannel.slice(1)}`;
                logger.cmds(logMessage);
            })
            .catch(err => {
                chat(channel, `Error executing message: ${err}`);
                logger.cmde(`>${this.name} | Message couldn't be executed! ${err}`);
            });
    }
};
