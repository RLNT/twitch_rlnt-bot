import { logger } from '@/startup.js';
import { Command } from '@internals/commandhandler.js';
import { uploadImage } from '@modules/imgur.js';
import { config } from '@utils/config.js';
import { chat, isWhitelisted } from '@utils/helpers.js';
import { ChatUserstate } from 'tmi.js';

const commandRegex = new RegExp(
    /^(https:\/\/i.imgur.com\/[a-z\d]+\.(?:png|jpg|jpeg))( )?(?:(\d{1,2})[.-](\d{1,2})[.-](\d{4}|\d{2})$)?/i
);

export const command: Command = {
    name: 'imgur',
    description: 'Uploads an image to the retard Imgur collection. When no date is defined, it will use todays date.',
    modRequired: false,
    cooldown: 5,
    usage: 'imgur <direct Imgur url> [date]',
    aliases: ['img'],
    async execute(channel: string, sender: ChatUserstate, args: string | undefined): Promise<void> {
        if (!isWhitelisted(sender, this.name)) {
            chat(channel, 'You are not whitelisted for this command!');
            return;
        }
        if (!args) {
            chat(channel, `Missing arguments! Try ${config.general.prefix}help ${this.name}`);
            return;
        }

        const [, url, whitespace, day, month, year] = args.match(commandRegex) || [];
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
                logger.command(`>${this.name} | Image was added to the Imgur album!`);
            })
            .catch(err => {
                chat(channel, `Error uploading to imgur album! Status: ${err}`);
                logger.command(`>${this.name} | Image couldn't be uploaded to the Imgur album!`, err);
            });
    }
};

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
