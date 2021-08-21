import { clientRegister, login, registerEvents } from '@internals/clienthandler.js';
import { loadCommands } from '@internals/commandhandler.js';
import { loadImgur } from '@modules/imgur.js';
import { loadConfig } from '@utils/config.js';
import { getVersion } from '@utils/helpers.js';
import { createLogger } from '@utils/logger.js';

export const logger = createLogger();

(async (): Promise<void> => {
    logger.info('RLNTBot');
    logger.info('Author: RLNT, DamnRelentless');
    logger.info(`Version: ${getVersion()}`);
    logger.blank();

    logger.start(`Bot is starting!`);
    try {
        await loadConfig();
        await clientRegister();
        await registerEvents();
        await loadCommands();
        await login();
        await loadImgur();
    } catch (err) {
        logger.blank();
        logger.fatal(err);
        process.exit(1);
    }
    logger.done(`Startup complete!`);
    logger.blank();
})();
