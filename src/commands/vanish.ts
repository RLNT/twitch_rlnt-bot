import { client } from '@internals/clienthandler';
import { Command } from '@internals/commandhandler.js';
import { chat } from '@utils/helpers.js';
import { ChatUserstate } from 'tmi.js';

export const command: Command = {
    name: 'vanish',
    description: 'Timeouts the command sender for a second.',
    modRequired: true,
    aliases: ['v', 'poof', 'hide'],
    async execute(channel: string, sender: ChatUserstate): Promise<void> {
        if (client.isMod(channel, sender.username || '')) {
            chat(channel, 'Try /unmod first. Okayge');
            return;
        }
        if (channel.includes(sender.username || '')) {
            chat(channel, "Can't timeout the broadcaster. BRUH");
            return;
        }
        chat(channel, `/timeout ${sender.username} 1s`);
    }
};
