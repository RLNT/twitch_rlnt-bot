import { Command } from '@internals/commandhandler';
import { config, writeConfig } from '@utils/config';
import { chat, isWhitelisted } from '@utils/helpers';
import { ChatUserstate } from 'tmi.js';

export const command: Command = {
    name: 'peter',
    description: 'Filters TheSteamraven.',
    modRequired: true,
    aliases: ['pedda', 'peta', 'steamraven', 'thesteamraven'],
    async execute(channel: string, sender: ChatUserstate): Promise<void> {
        if (!isWhitelisted(sender, this.name)) {
            chat(channel, 'You are not whitelisted for this command!');
            return;
        }
        if (config.persistent.peter) {
            chat(channel, 'Peter is no longer getting filtered. Sadge');
        } else {
            chat(channel, 'Peter is now getting filtered! DatSheffy');
        }
        config.persistent.peter = !config.persistent.peter;
        writeConfig();
    }
};
