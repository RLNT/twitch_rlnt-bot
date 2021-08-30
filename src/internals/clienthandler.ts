import { logger } from '@/startup';
import { handleCommand } from '@internals/commandhandler';
import { config, writeConfig } from '@utils/config';
import { chat } from '@utils/helpers';
import { Client } from 'tmi.js';

export let client: Client;

/** Registers the Twitch client with credentials from the config. */
export async function clientRegister(): Promise<void> {
    logger.info('Registering Twitch client...');

    try {
        // retrieve the required client information from the config
        client = new Client({
            connection: { reconnect: config.general.auto_reconnect },
            channels: config.general.channels,
            identity: {
                username: config.login.username,
                password: config.login.token
            }
        });
    } catch (err) {
        throw 'Failed to register Twitch client: ' + err;
    }

    logger.success('Twitch client registered!');
}

/** Registers necessary Twitch events for the client. */
export async function registerEvents(): Promise<void> {
    logger.info('Registering Twitch events...');

    // registers the reconnect event to log a simple message
    client.on('reconnect', async () => {
        logger.info('Twitch client reconnected!');
    });

    // registers the message event to log messages and pass possible commands to the command handler
    client.on('message', async (channel, sender, msg, isSelf) => {
        // ignore the bot itself
        if (isSelf) return;

        // pass the handling to the command handler if the message starts with the command prefix
        if (msg.startsWith(config.general.prefix)) {
            handleCommand(channel, sender, msg);
        } else {
            // only log messages with config option
            if (config.logging?.messages) {
                logger.log(`${channel} | ${sender['display-name']}: ${msg}`);
            }
        }
    });

    logger.success('Twitch events registered!');
}

/** Try to connect to the Twitch IRC server. */
export async function login(): Promise<void> {
    return new Promise(resolve => {
        logger.info('Logging in to Twitch IRC...');

        /**
         * Registers the connected event to log a simple message.
         *
         * This also ensures it's only fired once and won't spam the log.
         * Returns the promise of the function so the startup waits for the login.
         */
        client.once('connected', async () => {
            logger.success('Twitch client connected!');
            // send a message to the channel the restart was triggered from
            if (config.persistent.restartOrigin) {
                chat(config.persistent.restartOrigin, 'Successfully restarted!');
                config.persistent.restartOrigin = '';
                await writeConfig();
            }
            resolve();
        });

        try {
            client.connect();
        } catch (err) {
            throw 'Failed to login to Twitch IRC: ' + err;
        }
    });
}
