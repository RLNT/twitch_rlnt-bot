import { client } from '@internals/clienthandler';
import { Command } from '@internals/commandhandler';
import { chat } from '@utils/helpers';

export const command: Command = {
    name: 'ping',
    description: 'Pings the bot and informs about the latency.',
    modRequired: false,
    aliases: ['pong'],
    async execute(channel: string): Promise<void> {
        client
            .ping()
            .then((time: number[]) => {
                const ping = (time[0] || 0) * 1000;
                chat(channel, `Pong! Latency: ${ping}ms`);
            })
            .catch(err => {
                chat(channel, 'Ping request timed out!');
                console.error(err);
            });
    }
};
