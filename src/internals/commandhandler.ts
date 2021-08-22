import { logger } from '@/startup.js';
import { client } from '@internals/clienthandler.js';
import { config } from '@utils/config.js';
import { Collection, commandEnabled } from '@utils/helpers.js';
import { ChatUserstate } from 'tmi.js';

/** The command type representing the default structure of a command. */
export type Command = {
    readonly name: string;
    readonly description: string;
    readonly modRequired: boolean;
    readonly cooldown?: number;
    readonly usage?: string;
    readonly aliases?: string[];
    execute(channel?: string, sender?: ChatUserstate, argument?: string | undefined): Promise<void>;
};

const commandList = ['album', 'help', 'imgur', 'info', 'ping', 'reload', 'restart', 'stop'];
const commands = new Collection<string, Command>();
const cooldowns = new Collection<string, Collection<string, number>>();

/**
 * Loads commands dynamically from the command directory.
 *
 * Only registers commands that are enabled.
 */
export async function loadCommands(): Promise<void> {
    logger.info('Loading commands...');

    // load all command files from the command directory
    // temporarily disabled dynamic command loading because exe compiling is not compatible
    // const commandFiles = readdirSync(`${__dirname}/../commands`).filter(file => file.endsWith('.ts'));

    // register each command file to the available commands
    commandList.forEach(file => {
        try {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const { command } = require(`${__dirname}/../commands/${file}`) as { command: Command };
            if (!commandEnabled(command.name)) return;
            commands.set(command.name, command);
            logger.note(`Loaded command: ${command.name}`);
        } catch (err) {
            logger.error(`Failed to load command ${file}: `, err);
        }
    });

    logger.success(`${commands.size} commands loaded!`);
}

/** Reloads commands. */
export async function reloadCommands(): Promise<void> {
    commands.forEach(command => {
        delete require.cache[require.resolve(`${__dirname}/../commands/${command.name}`)];
    });
    commands.clear();
    await loadCommands();
}

/**
 * Handles commands from the Twitch chat.
 *
 * This basically splits the raw message into logical parts and calls the execute function of the dynamically loaded command.
 *
 * @param channel The channel the command was sent in
 * @param sender The user who sent the command
 * @param msg The raw message sent by the user
 */
export async function handleCommand(channel: string, sender: ChatUserstate, msg: string): Promise<void> {
    const commandRegex = new RegExp(`^${config.general.prefix}([a-zA-Z\\d]+)(?:\\W+)?(.*)?`);
    const [, commandName, args] = msg.match(commandRegex) || [];
    if (!commandName || !sender.username) return;

    // check if the keyword matches any command or any alias
    const command = getCommandByName(commandName);

    // cancel the command under certain conditions
    if (!command) {
        client.say(channel, 'This command does not exist!');
        logger.command(`${channel} | ${sender.username} tried using unrecognized command ${commandName}!`);
        return;
    }
    if (!commandEnabled(command.name)) {
        client.say(channel, 'This command is currently disabled!');
        logger.command(`${channel} | ${sender.username} tried using disabled command ${commandName}!`);
        return;
    }
    if (command.modRequired && !client.isMod(channel, client.getUsername())) {
        client.say(channel, 'This command is only available if the bot is a moderator of the channel!');
        logger.command(`${channel} | ${sender.username} tried using mod-only command ${commandName}!`);
        return;
    }

    // check if the command is on cooldown
    if (!cooldowns.has(command.name)) {
        cooldowns.set(command.name, new Collection<string, number>());
    }
    const now = Date.now();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const timestamps = cooldowns.get(command.name)!;
    const cooldown = (command.cooldown || 3) * 1000;
    if (timestamps.has(sender.username)) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const expiration = timestamps.get(sender.username)! + cooldown;
        if (now < expiration) return;
    }
    timestamps.set(sender.username, now);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    setTimeout(() => timestamps.delete(sender.username!), cooldown);

    // log to console if activated
    if (config.logging?.commands) {
        let logMessage = `${channel} | ${sender['display-name']} used the command: ${commandName}`;
        if (args) logMessage += ` | Args: ${args}`;
        logger.command(logMessage);
    }

    // execute the command
    try {
        await command.execute(channel, sender, args);
    } catch (err) {
        logger.error(`Error executing command ${command.name}:`, err);
    }
}

/**
 * Gets the command object by the command name or an alias.
 *
 * @param name The name of the command
 * @returns The command object or undefined if not found
 */
export function getCommandByName(name: string): Command | undefined {
    return (
        commands.get(name) ||
        commands.find(cmd => {
            if (!cmd.aliases) return false;
            return cmd.aliases.includes(name);
        })
    );
}

/**
 * Returns all loaded command names as an array.
 *
 * @returns An array of all loaded command names
 */
export function getLoadedCommands(): string[] {
    return Array.from(commands.keys());
}
