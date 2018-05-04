const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
    entry:  ['babel-polyfill', './app/index.js', './static/style.css'],
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js'
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /(node_modules)/,
                use: {
                    loader: 'babel-loader'
                }
            },
            {
                test: /\.css$/,
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: 'css-loader'
                })
            },
            {
                test: /\.(png|svg|jpg|gif)$/,
                use: {
                    loader: 'file-loader',
                    options: {
                        name: 'img/[name].[ext]',
                    }
                }
            },
        ]
    },
    plugins: [
        new ExtractTextPlugin("style.css"),
        new CleanWebpackPlugin(['dist']),
        new HtmlWebpackPlugin({
            template: './static/index.html',
            favicon: './static/favicon.ico'
        }),
        new CopyWebpackPlugin([
            {
                from: 'assets/game_data',
                to: 'data',
                toType: 'dir'
            },
            {
                from: 'assets/sprites',
                to: 'sprites',
                toType: 'dir'
            }
        ], { copyUnmodified: true, debug: false })
    ]
};
