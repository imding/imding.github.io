const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');

const path = require('path');
// const cdtoolDir = 'C:\\Users\\Ding\\Desktop\\github\\imding.github.io\\cdtool\\v2';
const cdtoolDir = '/Users/dare/Documents/GitHub/imding.github.io/cdtool/v2';

module.exports = {
    mode: 'development',
    devtool: 'source-map',
    entry: './src/core.ts',
    devServer: {
        port: 8000
    },
    output: {
        filename: 'main.js',
        chunkFilename: './chunks/[id].js',
        path: path.resolve(cdtoolDir)
    },
    module: {
        rules: [{
            test: /\.(sa|sc|c)ss$/,
            use: ['style-loader', 'css-loader', 'sass-loader',]
        }, {
            test: /\.ts$/,
            use: 'ts-loader'
        }, {
            test: /\.(woff(2)?|ttf|eot)(\?v=\d+\.\d+\.\d+)?$/,
            use: {
                loader: 'file-loader',
                options: {
                    name: '[name].[ext]',
                    outputPath: 'fonts/'
                }
            }
        }, {
            test: /\.html$/,
            use: 'html-loader'
        }, {
            test: /\.(png|jpe?g|gif|svg)$/i,
            use: {
                loader: 'file-loader',
                options: {
                    name: '[name].[hash].[ext]',
                    outputPath: 'images'
                }
            }
        }]
    },
    node: {
        fs: 'empty'
    },
    resolve: {
        modules: [path.join(__dirname, 'src'), 'node_modules'],
        extensions: ['.js', '.ts', '.scss']
    },
    plugins: [
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            hash: true,
            filename: 'index.html',
            template: './src/template.html',
        }),
        new MonacoWebpackPlugin({
            output: './monaco/',
            languages: ['typescript', 'javascript', 'css', 'html'],
        }),
    ],
};
