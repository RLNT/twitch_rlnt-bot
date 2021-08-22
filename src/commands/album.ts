import { Command } from '@internals/commandhandler.js';
import { config } from '@utils/config.js';
import { chat } from '@utils/helpers.js';

export const command: Command = {
    name: 'album',
    description: 'Gives the URL to the Imgur album.',
    modRequired: false,
    aliases: ['collection', 'retards'],
    async execute(channel: string): Promise<void> {
        chat(channel, `https://imgur.com/a/${config.imgur.album_id}`);
    }
};
