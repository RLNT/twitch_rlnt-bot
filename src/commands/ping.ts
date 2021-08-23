import { client } from '@internals/clienthandler.js';
import { Command } from '@internals/commandhandler.js';
import { chat } from '@utils/helpers.js';

export const command: Command = {
    name: 'ping',
    description: 'Pings the bot and informs about the latency.',
    modRequired: false,
    aliases: ['pong'],
    async execute(channel: string): Promise<void> {
        client
            .ping()
            .then((time: number[]) => {
                chat(channel, `Pong! Latency: ${time}s`);
            })
            .catch(err => {
                chat(channel, 'Ping request timed out!');
                console.error(err);
            });
    }
};
