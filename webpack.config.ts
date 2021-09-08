import { resolve } from 'path';
import { Configuration } from 'webpack';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { paths } = require('./tsconfig.json').compilerOptions;

type Aliases = {
    [key: string]: string;
};

const config: Configuration = {
    entry: './src/startup.ts',
    mode: 'production',
    node: {
        __dirname: true
    },
    target: 'node',
    devtool: false,
    externals: {
        bufferutil: 'bufferutil',
        'utf-8-validate': 'utf-8-validate',
        'stream/web': 'stream/web'
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                loader: 'ts-loader',
                exclude: /node_modules/
            }
        ]
    },
    resolve: {
        extensions: ['.js', '.ts'],
        alias: resolveTSPaths()
    },
    output: {
        filename: 'RLNTBot.js',
        path: resolve(__dirname, 'out')
    }
};

export default config;

/**
 * Retrieves the paths from the tsconfig.json and creates an alias for each path.
 *
 * @returns An array of path mapping aliases
 */
function resolveTSPaths(): Aliases {
    const aliases: Aliases = {};
    Object.keys(paths).forEach(key => {
        const alias = key.replace('/*', '');
        const path = resolve(__dirname, 'src', paths[key][0].replace('/*', '').replace('*', ''));
        aliases[alias] = path;
    });
    return aliases;
}
