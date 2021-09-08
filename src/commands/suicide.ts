import { logger } from '@/startup';
import { client } from '@internals/clienthandler';
import { Command } from '@internals/commandhandler';
import { chat } from '@utils/helpers';
import { ChatUserstate } from 'tmi.js';

export const command: Command = {
    name: 'suicide',
    description: 'Timeouts the command sender for 24 hours.',
    modRequired: true,
    aliases: ['fortnite', 'sudoku'],
    async execute(channel: string, sender: ChatUserstate): Promise<void> {
        if (channel.includes(sender.username || '')) {
            chat(channel, "Can't kill the broadcaster. BRUH");
            return;
        }

        client
            .timeout(channel, sender.username || '', 86400)
            .then(() => {
                logger.cmds(`>${this.name} | ${sender.username} has suicided!`);
            })
            .catch(err => {
                if (err === 'bad_timeout_mod') {
                    chat(channel, 'Try /unmod first. Okayge');
                    return;
                }
                logger.cmde(`${sender.username} couldn't be suicided!`, err);
            });
    }
};
