import { logger } from '@/startup';
import { client } from '@internals/clienthandler';
import { Command } from '@internals/commandhandler';
import { config } from '@utils/config';
import { chat, isWhitelisted } from '@utils/helpers';
import { ChatUserstate } from 'tmi.js';

export const command: Command = {
    name: 'exec',
    description: 'Executes a message as the bot.',
    modRequired: true,
    usage: 'exec [/]<message>',
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

        if (!args.startsWith('/')) args = `/${args}`;
        client.say(channel, args);
        logger.command(`>${this.name} | Message was executed!`);
    }
};
