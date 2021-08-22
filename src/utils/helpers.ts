import { logger } from '@/startup.js';
import { client } from '@internals/clienthandler.js';
import { reloadCommands } from '@internals/commandhandler.js';
import { config, loadConfig } from '@utils/config.js';
import { ChatUserstate } from 'tmi.js';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const version = require('../../package.json').version;

/** A custom data type which extends a map with some useful functionality. */
export class Collection<K, V> extends Map<K, V> {
    public constructor() {
        super();
    }

    /**
     * Searches for the first item where the given functions returns true.
     *
     * @param fn The function to test with
     * @returns The found item or `undefined` if nothing was found
     */
    public find(fn: (value: V, key: K, collection: this) => boolean): V | undefined {
        for (const [key, val] of Array.from(this)) {
            if (fn(val, key, this)) return val;
        }
        return undefined;
    }
}

/**
 * Splits messages so that they don't exceed the maximum character limit.
 *
 * @param message The message to split
 * @returns Message the message as a split array
 */
export function splitMessage(message: string): string[] {
    if (message.length > 500) {
        const split = message.match(/.{1,500}(?:\s|$)/g);
        if (split) return split.map(s => s.trim());
    }
    return [message];
}

/**
 * Sends a message to the given channel and automatically splits the message if it exceeds the character limit.
 *
 * @param channel The channel to send the message in
 * @param message The message to send
 */
export function chat(channel: string, message: string | string[]): void {
    if (Array.isArray(message)) message = message.join('');
    const split = splitMessage(message);
    split.forEach(async msg => {
        await client.say(channel, msg);
    });
}

/**
 * Gets the whitelist for a specified command from the config.
 *
 * @param command The name of the command
 * @returns The whitelist entry from the config if any, empty array otherwise
 */
export function getWhitelist(command: string): string[] {
    if (!config.commands) return [];
    const commandConfig = config.commands[command];
    if (!commandConfig) return [];
    return typeof commandConfig.enabled === 'undefined' ? [] : commandConfig.whitelist ?? [];
}

/**
 * Determines whether a user is listed for a specific command list.
 *
 * @param sender The sender of the command
 * @param command The name of the command
 * @param type The type of the list to check
 * @returns True if listed, false otherwise
 */
export function isListed(sender: ChatUserstate | string, command: string, type: 'whitelist' | 'admins'): boolean {
    const list = getListFromCommand(command, type);
    const senderName = typeof sender === 'string' ? sender.toLowerCase() : (sender.username ?? '').toLowerCase();
    if (list.length === 0 || senderName === '') return false;
    return list.includes(senderName);
}

/**
 * Gets a list of a command from the config.
 *
 * @param command The name of the command
 * @param type The type of the list
 * @returns The list of the command or an empty array if not found
 */
export function getListFromCommand(command: string, type: 'whitelist' | 'admins'): string[] {
    if (!config.commands) return [];
    const list = config.commands[command]?.[type] ?? [];
    return list.length === 0 ? [] : list.map(name => name.toLowerCase());
}

/** Reloads configuration and all commands. */
export async function reload(): Promise<void> {
    logger.blank();
    logger.warn('A reload is being performed!');
    await loadConfig();
    await reloadCommands();
    logger.success('Reload complete!');
    logger.blank();
}

/**
 * Gets the bot version from the package.json.
 *
 * @returns The bot version as a string
 */
export function getVersion(): string {
    return version;
}

/**
 * Checks the config if a specific command is enabled.
 *
 * This ensures that a command is also enabled if the config entry is missing. To deactivate a command, it needs to be
 * explicetely disabled in the config.
 *
 * @param command The name of the command
 * @returns True if the command is enabled, false otherwise
 */
export function commandEnabled(command: string): boolean {
    if (!config.commands) return true;
    const commandConfig = config.commands[command];
    if (!commandConfig) return true;
    return typeof commandConfig.enabled === 'undefined' || commandConfig.enabled;
}