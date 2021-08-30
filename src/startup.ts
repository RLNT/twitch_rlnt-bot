import { clientRegister, login, registerEvents } from '@internals/clienthandler';
import { loadCommands } from '@internals/commandhandler';
import { loadImgur } from '@modules/imgur';
import { loadConfig } from '@utils/config';
import { getLatestVersion, getVersion } from '@utils/helpers';
import { createLogger } from '@utils/logger';

export const logger = createLogger();

(async (): Promise<void> => {
    logger.info('RLNTBot');
    logger.info('Author: RLNT, DamnRelentless');

    const version = getVersion();
    const latestVersion = await getLatestVersion();
    logger.info(`Current Version: ${version}`);
    logger.info(`Latest Version: ${latestVersion}`);
    if (version !== latestVersion) logger.note('New Version available!');
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
