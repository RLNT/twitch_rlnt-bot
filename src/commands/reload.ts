import { Command } from '@internals/commandhandler.js';
import { chat, isWhitelisted, reload } from '@utils/helpers.js';
import { ChatUserstate } from 'tmi.js';

export const command: Command = {
    name: 'reload',
    cooldown: 5,
    modRequired: false,
    description: 'Reloads the configuration and all commands. Config options related to clients need a bot restart.',
    async execute(channel: string, sender: ChatUserstate): Promise<void> {
        if (!isWhitelisted(sender, this.name)) {
            chat(channel, 'You are not whitelisted for this command!');
            return;
        }

        await reload();
        chat(channel, 'Reloaded the configuration and all commands!');
    }
};
