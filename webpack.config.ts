import { resolve } from 'path';
import ResolvePlugin from 'ts-paths-resolve-plugin';
import { Configuration } from 'webpack';

const config: Configuration = {
    entry: './src/startup.ts',
    mode: 'production',
    node: {
        __dirname: true
    },
    target: 'node',
    devtool: 'inline-source-map',
    externals: {
        bufferutil: 'bufferutil',
        'utf-8-validate': 'utf-8-validate'
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader',
                exclude: /node_modules/
            }
        ]
    },
    resolve: {
        plugins: [new ResolvePlugin()],
        extensions: ['.js', '.ts']
    },
    output: {
        filename: 'RLNTBot.js',
        path: resolve(__dirname, 'out')
    }
};

export default config;
