import { logger } from '@/startup';
import { client } from '@internals/clienthandler';
import { Command } from '@internals/commandhandler';
import { config, writeConfig } from '@utils/config';
import { chat, isInChannel, isWhitelisted } from '@utils/helpers';
import { ChatUserstate } from 'tmi.js';

export const command: Command = {
    name: 'leave',
    description: 'Leaves a specified channel or the current channel if no argument is provided.',
    modRequired: false,
    usage: 'laeve [channel]',
    aliases: ['part'],
    async execute(channel: string, sender: ChatUserstate, args: string): Promise<void> {
        if (!isWhitelisted(sender, this.name)) {
            chat(channel, 'You are not whitelisted for this command!');
            return;
        }
        if (!args || channel.slice(1) === args) {
            chat(channel, 'Leaving the channel! peepoLeave');
            client
                .part(channel)
                .then(() => {
                    logger.cmds(`>${this.name} | Left channel ${channel.slice(1)}!`);
                })
                .catch(err => {
                    chat(channel, `Error leaving this channel! | Reason: ${err}`);
                    logger.cmde(`>${this.name} | Channel ${channel.slice(1)} couldn't be left!`, err);
                });
            return;
        }
        if (args.includes(' ')) {
            chat(channel, 'Invalid channel name!');
            return;
        }
        if (!isInChannel(args)) {
            chat(channel, `I'm not in channel ${args}!`);
            return;
        }

        client
            .part(args)
            .then(() => {
                chat(channel, `Successfully left ${args}!`);
                logger.cmds(`>${this.name} | Left channel ${args}!`);
                config.general.channels.splice(
                    config.general.channels.indexOf(args.startsWith('#') ? args : `#${args}`),
                    1
                );
                writeConfig();
            })
            .catch(err => {
                chat(channel, `Error leaving channel ${args}! | Reason: ${err}`);
                logger.cmde(`>${this.name} | Channel ${args} couldn't be left!`, err);
            });
    }
};
