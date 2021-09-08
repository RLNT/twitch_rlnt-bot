import { logger } from '@/startup';
import { reloadCommands } from '@internals/commandhandler';
import { Client as ImgurClient } from '@rmp135/imgur';
import { config, writeConfig } from '@utils/config';
import { commandEnabled } from '@utils/helpers';
import promptly from 'promptly';

let imgurClient: ImgurClient;
let albumID: string;
const tokenRegex = new RegExp(
    /^https:\/\/imgur\.com\/(?:\?state=application\+state)?#access_token=([a-z\d]+)&expires_in=\d+&token_type=bearer&refresh_token=([a-z\d]+)/
);

/**
 * Loads the Imgur client and the album id from the config.
 *
 * @returns Rejects promise when no access token was found
 */
export async function loadImgur(): Promise<void> {
    if (!commandEnabled('imgur')) return;
    logger.info('Setting up Imgur module...');
    albumID = config.imgur.album_id;

    if (!config.imgur.access_token || !config.imgur.refresh_token) await authenticate();
    if (config.imgur.access_token && config.imgur.refresh_token) {
        imgurClient = new ImgurClient({
            access_token: config.imgur.access_token,
            client_id: config.imgur.client_id,
            client_secret: config.imgur.client_secret,
            refresh_token: config.imgur.refresh_token
        });

        await imgurClient.Authorize.regenerateFromRefreshToken(config.imgur.refresh_token);
        if (imgurClient.access_token && imgurClient.refresh_token) {
            config.imgur.access_token = imgurClient.access_token;
            config.imgur.refresh_token = imgurClient.refresh_token;
            await writeConfig();
        }

        logger.success('Imgur module was set up successfully!');
        return;
    }
    await disableModule();
}

/** Handles the Imgur authentication if the config doesn't contain the credentials yet. */
async function authenticate(): Promise<void> {
    const authClient = new ImgurClient({
        client_id: config.imgur.client_id,
        client_secret: config.imgur.client_secret
    });
    const auth = authClient.Authorize.byToken('application state');

    logger.blank();
    logger.warn('You do not have an Imgur access and refresh token yet!');
    logger.note('Please head over to the following URL to generate your Imgur access token: ', auth.url);
    const url = await promptly.prompt('Enter the url:');
    logger.blank();

    const [raw, accessToken, refreshToken] = url.match(tokenRegex) || [];
    if (!raw || !accessToken || !refreshToken) {
        await disableModule();
        return;
    }

    config.imgur.access_token = accessToken;
    config.imgur.refresh_token = refreshToken;
    await writeConfig();

    auth.authorize(raw);
}

/** Disabled the Imgur module and command. */
async function disableModule(): Promise<void> {
    logger.warn('No Imgur access token found! Deactivating Imgur module and command.');
    if (!config.commands) config.commands = {};
    if (!config.commands['imgur']) config.commands['imgur'] = {};
    config.commands['imgur'].enabled = false;
    await reloadCommands();
}

/**
 * Uploads a file to the imgur album from the config.
 *
 * @param url The url of the image to upload
 * @param date The date which will be set as image description
 */
export async function uploadImage(url: string, date: string): Promise<void> {
    return new Promise((resolve, reject) => {
        imgurClient.Image.upload(url, {
            type: 'url',
            album: albumID,
            description: date
        })
            .then(response => {
                if (response.success) {
                    return resolve();
                } else {
                    return reject(response.status);
                }
            })
            .catch(err => {
                reject(err);
            });
    });
}
