import { LoggerConfiguration, Signale, SignaleConstructorOptions } from 'lazy-signale';

type CustomLogger =
    | 'await'
    | 'blank'
    | 'command'
    | 'commande'
    | 'complete'
    | 'debug'
    | 'done'
    | 'error'
    | 'fatal'
    | 'fav'
    | 'info'
    | 'log'
    | 'note'
    | 'pause'
    | 'pending'
    | 'star'
    | 'start'
    | 'success'
    | 'wait'
    | 'warn'
    | 'watch';

/**
 * Creates a new Signale logger with some pre-defined options.
 *
 * @returns The instance of the logger
 */
export function createLogger(): Signale<CustomLogger> {
    const typeInfo: LoggerConfiguration = {
        badge: 'i',
        color: 'blue',
        label: 'info',
        logLevel: 'info'
    };

    const typeNote: LoggerConfiguration = {
        badge: '*',
        color: 'magenta',
        label: 'note',
        logLevel: 'info'
    };

    const typeBlank: LoggerConfiguration = {
        badge: '',
        color: 'gray',
        label: '----------',
        logLevel: 'info'
    };

    const typeDone: LoggerConfiguration = {
        badge: '❤',
        color: 'magentaBright',
        label: 'done',
        logLevel: 'info'
    };

    const typeLogging: LoggerConfiguration = {
        badge: '~',
        color: 'cyan',
        label: 'log',
        logLevel: 'info'
    };

    const typeCommand: LoggerConfiguration = {
        badge: '~',
        color: 'cyan',
        label: 'cmd',
        logLevel: 'info'
    };

    const typeCommandE: LoggerConfiguration = {
        badge: '~',
        color: 'red',
        label: 'cmd',
        logLevel: 'info'
    };

    const options: SignaleConstructorOptions<CustomLogger> = {
        types: {
            info: typeInfo,
            log: typeLogging,
            note: typeNote,
            blank: typeBlank,
            done: typeDone,
            command: typeCommand,
            commande: typeCommandE
        }
    };

    const logger = new Signale(options);
    logger.config({
        displayTimestamp: true,
        underlineLabel: false,
        uppercaseLabel: true
    });
    return logger;
}
