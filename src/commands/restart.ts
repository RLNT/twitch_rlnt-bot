import { logger } from '@/startup.js';
import { Command } from '@internals/commandhandler.js';
import { config, writeConfig } from '@utils/config';
import { chat, isWhitelisted } from '@utils/helpers.js';
import { ChatUserstate } from 'tmi.js';

export const command: Command = {
    name: 'restart',
    description: 'Restarts the bot.',
    modRequired: false,
    async execute(channel: string, sender: ChatUserstate): Promise<void> {
        if (!isWhitelisted(sender, this.name)) {
            chat(channel, 'You are not whitelisted for this command!');
            return;
        }
        chat(channel, 'Restarting...');
        logger.command(`>${this.name} | ${sender.username} restarted the bot!`);

        // save the origin channel to the config to send a message after the restart
        config.persistent.restartOrigin = channel;
        await writeConfig();

        // stop the process with a success code so systemd does restart it
        process.exit(0);
    }
};
