const path = require('path');
const webpack = require('webpack');
const nodeExternals = require('webpack-node-externals');
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const merge = require('webpack-merge');
const webCommon = require('./webpack.config.common.js');
const fs = require('fs');

function getEntriesForApi() {
    return fs.readdirSync('./api/')
        .filter(file => file.match(/.*\.js$/))
        .map(file => {return {name: file.substring(0, file.length - 3), path: `./api/${file}`}})
        .reduce((memo, file) => {
            memo[file.name] = file.path;
            return memo;
        }, {})
}

const webConfig = {
    mode: 'production',
    plugins: [
        new CleanWebpackPlugin(['dist']),
        new CopyWebpackPlugin([
            /*
            {from: './conf',to:'./conf'},
            {from: './cls/mongo.js',to: './cls/mongo.js'},
            {from: './cls/mssql.js',to: './cls/mssql.js'},
            {from: './views/error.ejs', to:'./dist/views/error.ejs'},
            */
            //{from: './api',to:'./api'},
            //{from: './bin', to: './bin'},
            //{from: './app.js',to: './app.js'},
        ])
    ],
    performance: {
        hints: false
    },
};

//공통
const sampleConfig = {
    mode: 'production',
    resolve: {
        extensions: [".ts", ".tsx", ".js"]
    },
    target: 'node',
    node: {
        __dirname: true,
    },
    externals: [nodeExternals()],
    module: {
        rules: [
            {
                // Transpiles ES6-8 into ES5
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader",
                    options: {
                        presets:['@babel/preset-env']
                    }
                }
            },
            {
                test: /\.tsx?$/, loader: ["babel-loader","ts-loader"], exclude: "/node_modules/"
            },
        ]
    }
};

const svrConfig = Object.assign({}, sampleConfig,{
    entry: {'app': './app.js'},
    output: {
        path: path.join(__dirname, 'dist'),
        publicPath: '/',
        filename: '[name].js',
    }
});

const apiConfig = Object.assign({}, sampleConfig,{
    entry: getEntriesForApi(),
    output: {
        path: path.join(__dirname, 'dist','api'),
        publicPath: '/',
        filename: '[name].js',
    }
});

module.exports = [merge(webCommon, webConfig), svrConfig, apiConfig];