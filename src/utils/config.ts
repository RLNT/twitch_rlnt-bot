import { logger } from '@/startup';
import * as TOML from '@iarna/toml';
import { accessSync, constants, fstatSync, openSync, PathLike, readFileSync, Stats, writeFileSync } from 'fs';
import { resolve } from 'path';

type Config = {
    readonly login: {
        readonly username: string;
        readonly token: string;
    };
    readonly general: {
        readonly prefix: string;
        channels: string[];
        readonly auto_reconnect: boolean;
        readonly colored: boolean;
    };
    readonly logging: {
        readonly messages: boolean;
        readonly commands: boolean;
    };
    readonly imgur: {
        readonly album_id: string;
        readonly client_id: string;
        readonly client_secret: string;
        access_token?: string;
        refresh_token?: string;
    };
    commands?: {
        [command: string]: CommandConfig | undefined;
    };
    persistent: {
        restartOrigin: string;
    };
};

type CommandConfig = {
    enabled?: boolean;
    whitelist?: string[];
};

export let config: Config;
const directory: PathLike = resolve(__dirname, '..', '..', 'config/config.toml');

/** Loads the TOML configuration and overwrites the global config variable. */
export async function loadConfig(): Promise<void> {
    logger.info('Loading configuration...');
    try {
        checkPermission(directory);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
        if (err.code === 'ENOENT') {
            logger.error('Configuration file not found! Are you executing from the correct directory?');
            throw `Didn't find configuration file in ${directory}`;
        } else {
            throw err;
        }
    }

    await TOML.parse
        .async(readFileSync(directory, 'utf8'))
        .then(toml => {
            config = <Config>toml;
            logger.success('Configuration loaded!');
        })
        .catch(e => {
            throw e;
        });
}

/** Saves the TOML configuration and overwrites the config variables. */
export async function writeConfig(): Promise<void> {
    try {
        checkPermission(directory);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
        if (err.code === 'ENOENT') {
            // ignore
        } else {
            throw err;
        }
    }

    config.general.channels = config.general.channels.map(channel => {
        if (!channel.startsWith('#')) return channel;
        return channel.slice(1);
    });

    writeFileSync(directory, TOML.stringify(<TOML.JsonMap>config), 'utf8');
}

/**
 * Checks permission for the config file, if it exists and if it's accessible.
 *
 * @param path The path to the config file
 */
function checkPermission(path: PathLike): void {
    accessSync(path, constants.F_OK | constants.R_OK);
    const platform: string = process.platform;

    if (platform === 'win32') return;

    const fd: number = openSync(path, 'r');
    const stats: Stats = fstatSync(fd);
    const mode: number = stats.mode & 0o777;

    if (mode < 0o600) throw `Configuration must have a file mode of at least 600 but has ${mode.toString(8)}!`;
}
