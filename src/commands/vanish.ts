import { logger } from '@/startup';
import { client } from '@internals/clienthandler';
import { Command } from '@internals/commandhandler';
import { chat } from '@utils/helpers';
import { ChatUserstate } from 'tmi.js';

export const command: Command = {
    name: 'vanish',
    description: 'Timeouts the command sender for a second.',
    modRequired: true,
    aliases: ['v', 'poof', 'hide'],
    async execute(channel: string, sender: ChatUserstate): Promise<void> {
        if (channel.includes(sender.username || '')) {
            chat(channel, "Can't timeout the broadcaster. BRUH");
            return;
        }

        client
            .timeout(channel, sender.username || '', 1)
            .then(() => {
                logger.command(`>${this.name} | ${sender.username} was vanished!`);
            })
            .catch(err => {
                if (err === 'bad_timeout_mod') {
                    chat(channel, 'Try /unmod first. Okayge');
                    return;
                }
                logger.commande(`${sender.username} couldn't be vanished!`, err);
            });
    }
};
