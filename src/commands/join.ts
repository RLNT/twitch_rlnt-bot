import { logger } from '@/startup';
import { client } from '@internals/clienthandler';
import { Command } from '@internals/commandhandler';
import { config, writeConfig } from '@utils/config';
import { chat, isWhitelisted } from '@utils/helpers';
import { ChatUserstate } from 'tmi.js';

export const command: Command = {
    name: 'join',
    description: 'Joins a specified channel.',
    modRequired: false,
    usage: 'join <channel>',
    aliases: ['enter'],
    async execute(channel: string, sender: ChatUserstate, args: string): Promise<void> {
        if (!isWhitelisted(sender, this.name)) {
            chat(channel, 'You are not whitelisted for this command!');
            return;
        }
        if (!args) {
            chat(channel, `Missing argument! Try ${config.general.prefix}help ${this.name}`);
            return;
        }
        if (args.includes(' ')) {
            chat(channel, 'Invalid channel name!');
            return;
        }
        if (channel === args) {
            chat(channel, 'You are typing in that channel right now! BRUH');
            return;
        }
        if (config.general.channels.includes(args)) {
            chat(channel, `I'm already in channel ${args}!`);
            return;
        }

        client
            .join(args)
            .then(() => {
                chat(channel, `Successfully joined ${args}!`);
                logger.command(`>${this.name} | Joined channel ${args}!`);
                config.general.channels.push(args);
                writeConfig();
            })
            .catch(err => {
                chat(channel, `Error joining channel ${args}! | Reason: invalid channel`);
                logger.commande(`>${this.name} | Channel ${args} couldn't be joined!`, err);
            });
    }
};
