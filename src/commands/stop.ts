import { Command } from '@internals/commandhandler.js';
import { chat, isListed } from '@utils/helpers.js';
import { ChatUserstate } from 'tmi.js';
import { logger } from '../startup';

export const command: Command = {
    name: 'stop',
    description: 'Stops the bot.',
    aliases: ['restart'],
    async execute(channel: string, sender: ChatUserstate): Promise<void> {
        if (!isListed(sender, this.name, 'whitelist')) {
            chat(channel, 'You are not whitelisted for this command!');
            return;
        }
        chat(channel, 'Stopping...');
        logger.command(`>${this.name} | ${sender.username} stopped the bot!`);
        process.exit(0);
    }
};
