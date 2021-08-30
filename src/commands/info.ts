import { Command } from '@internals/commandhandler';
import { chat, getVersion } from '@utils/helpers';

export const command: Command = {
    name: 'info',
    description: 'Shows version and information.',
    modRequired: false,
    aliases: ['i', 'about', 'version', 'bot'],
    async execute(channel: string): Promise<void> {
        chat(channel, `I am a utility bot made by DamnRelentless! | Version: ${getVersion()}`);
    }
};
