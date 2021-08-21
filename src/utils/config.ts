import { logger } from '@/startup.js';
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
        readonly channels: string[];
        readonly auto_reconnect: boolean;
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
        readonly album?: CommandConfig | undefined;
        readonly help?: CommandConfig | undefined;
        imgur?: CommandConfig | undefined;
        readonly info?: CommandConfig | undefined;
        readonly ping?: CommandConfig | undefined;
        readonly reload?: CommandConfig | undefined;
        [command: string]: CommandConfig | undefined;
    };
};

type CommandConfig = {
    enabled?: boolean;
    whitelist?: string[];
    readonly admins?: string[];
};

export let config: Config;
const directory: PathLike = resolve(__dirname, '..', '..', 'config/config.toml');

/** Loads the TOML configuration and overwrites the global config variable. */
export async function loadConfig(): Promise<void> {
    logger.info('Loading configuration...');
    try {
        checkPermission(directory);
    } catch (err) {
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
    } catch (e) {
        if (e.code === 'ENOENT') {
            // ignore
        } else {
            throw e;
        }
    }

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
