import { logger } from '@/startup';
import { Command } from '@internals/commandhandler';
import { chat, isWhitelisted } from '@utils/helpers';
import { ChatUserstate } from 'tmi.js';

export const command: Command = {
    name: 'stop',
    description: 'Stops the bot.',
    modRequired: false,
    async execute(channel: string, sender: ChatUserstate): Promise<void> {
        if (!isWhitelisted(sender, this.name)) {
            chat(channel, 'You are not whitelisted for this command!');
            return;
        }
        chat(channel, 'Stopping...');
        logger.cmds(`>${this.name} | ${sender.username} stopped the bot!`);
        // stop the process with an error code so systemd does not restart it
        process.exit(1);
    }
};
