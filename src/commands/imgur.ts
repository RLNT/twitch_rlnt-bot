import { logger } from '@/startup.js';
import { Command } from '@internals/commandhandler.js';
import { uploadImage } from '@modules/imgur.js';
import { config, writeConfig } from '@utils/config.js';
import { chat, isListed } from '@utils/helpers.js';
import { ChatUserstate } from 'tmi.js';
import { getListFromCommand } from '../utils/helpers';

const commandName = 'imgur';
const uploadRegex = new RegExp(
    /^(https:\/\/i.imgur.com\/[a-zA-Z\d]+\.(?:png|jpg|jpeg))(\W+)?(?:(\d{1,2})[.-](\d{1,2})[.-](\d{4}|\d{2})$)?/
);
const whitelistRegex = new RegExp(/^whitelist\W*(?:(add|remove|list)\W*)?([a-z]+)?$/);

export const command: Command = {
    name: commandName,
    description: 'Uploads an image to the retard Imgur collection. When no date is defined, it will use todays date.',
    cooldown: 5,
    usage: 'imgur <direct Imgur url> [date]',
    aliases: ['img'],
    async execute(channel: string, sender: ChatUserstate, argument: string | undefined): Promise<void> {
        if (!isListed(sender, this.name, 'whitelist')) {
            chat(channel, 'You are not whitelisted for this command!');
            return;
        }

        if (!argument) {
            chat(channel, `Missing arguments! Try ${config.general.prefix}help imgur`);
            return;
        }

        if (argument.toLowerCase().startsWith('whitelist')) {
            if (!isListed(sender, this.name, 'admins')) {
                chat(channel, 'You are not allowed to whitelist users!');
                return;
            }
            whitelist(channel, argument.toLowerCase());
        } else {
            upload(channel, argument);
        }
    }
};

/**
 * Handles the whitelist subcommand.
 *
 * @param channel The channel the command was sent in
 * @param argument The whole command after the main command keyword
 */
async function whitelist(channel: string, argument: string): Promise<void> {
    const [, subcommand, user] = argument.match(whitelistRegex) || [];

    if (!subcommand) {
        chat(channel, 'Missing sub command! Available sub commands: add, remove, list');
        return;
    }

    if (!user && subcommand !== 'list') {
        chat(channel, 'Please specify a username!');
        return;
    }

    let index: number;
    const whitelist = getListFromCommand(commandName, 'whitelist');
    if (!config.commands) config.commands = {};
    if (!config.commands.imgur) config.commands.imgur = {};
    if (!config.commands.imgur.whitelist) config.commands.imgur.whitelist = [];

    switch (subcommand) {
        case 'add':
            if (!user) return;
            if (isListed(user, 'imgur', 'whitelist')) {
                chat(channel, `${user} is already whitelisted!`);
                return;
            }

            config.commands.imgur.whitelist.push(user);
            await writeConfig();
            chat(channel, `${user} was added to the whitelist!`);
            logger.command(`>${commandName} | ${user} was added to the Imgur whitelist!`);
            break;
        case 'remove':
            if (!user) return;
            index = whitelist.indexOf(user);
            if (index === -1) {
                chat(channel, `${user} is not whitelisted!`);
                return;
            }

            whitelist.splice(index, 1);
            config.commands.imgur.whitelist = whitelist;
            await writeConfig();
            chat(channel, `${user} was removed from the whitelist!`);
            logger.command(`>${commandName} | ${user} was removed from the Imgur whitelist!`);
            break;
        case 'list':
            chat(channel, `Whitelisted users: ${whitelist.join(', ')}`);
            break;
        default:
            chat(channel, 'Invalid subcommand!');
            break;
    }
}

/**
 * Handles the upload procedure. This is used by default and doesn't have a subcommand.
 *
 * @param channel The channel the command was sent in
 * @param argument The whole command after the main command keyword
 */
async function upload(channel: string, argument: string): Promise<void> {
    const [, url, whitespace, day, month, year] = argument.match(uploadRegex) || [];

    if (!url) {
        chat(channel, 'You entered an invalid URL!');
        return;
    }

    if (whitespace && (!day || !month || !year)) {
        chat(channel, 'You entered a malformed date!');
        return;
    }

    let date: string;
    try {
        date = await formDate(day, month, year);
    } catch (err) {
        chat(channel, 'The date you entered has an invalid day or month!');
        return;
    }

    chat(channel, 'Uploading image to Imgur...');
    uploadImage(url, date)
        .then(() => {
            chat(channel, `Uploaded to Imgur album! https://imgur.com/a/${config.imgur.album_id}`);
            logger.command(`>${commandName} | Image was added to the Imgur album!`);
        })
        .catch(err => {
            chat(channel, `Error uploading to imgur album! Status: ${err}`);
            logger.command(`>${commandName} | Image couldn't be uploaded to the Imgur album!`, err);
        });
}

/**
 * Forms a date from the given arguments or falls back to the current date.
 *
 * @param day The day from the command arguments
 * @param month The month from the command arguments
 * @param year The year from the command arguments
 * @returns Date the formed date
 */
async function formDate(day: string | undefined, month: string | undefined, year: string | undefined): Promise<string> {
    return new Promise((resolve, reject) => {
        if (!day || !month || !year) {
            const today: Date = new Date();
            resolve(`${today.getDate()}.${today.getMonth() + 1}.${today.getFullYear()}`);
        } else {
            if (parseInt(day) > 31 || parseInt(month) > 12) return reject();
            resolve(`${day}.${month}.${year}`);
        }
    });
}
