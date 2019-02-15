const path = require('path');
const webpack = require('webpack');
const nodeExternals = require('webpack-node-externals');
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const merge = require('webpack-merge');
const HtmlWebpackHardDiskPlugin = require('html-webpack-harddisk-plugin');


const webCommon = require('./webpack.config.common.js');
const webConfig = {
    mode: 'development',
    plugins: [
        new CleanWebpackPlugin(['dist']),
        new webpack.HotModuleReplacementPlugin(),
        new HtmlWebpackHardDiskPlugin(),
        new CopyWebpackPlugin([
            /*
            {from: './conf',to:'./conf'},
            {from: './cls/mongo.js',to: './cls/mongo.js'},
            {from: './cls/mssql.js',to: './cls/mssql.js'},
            */
        ]),
    ],
    devtool: "inline-source-map",
    devServer: {
        contentBase: path.resolve(__dirname, "dist"),
        watchContentBase: true,
        //overlay: true,
        stats: {
            colors: true,
            hash: false,
            version: false,
            timings: false,
            assets: false,
            chunks: false,
            modules: false,
            reasons: false,
            children: false,
            source: false,
            errors: true,
            errorDetails: false,
            warnings: false,
            publicPath: true
        },
        hot: true,
        inline: true,
        historyApiFallback: false,
        noInfo: true,
        compress: false,
    },
    performance: {
        hints: false
    },
};
module.exports = [
    merge(webCommon, webConfig)
];
