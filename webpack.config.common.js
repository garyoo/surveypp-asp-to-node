const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require("html-webpack-plugin");
const SriPlugin = require('webpack-subresource-integrity');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const hmwScript = `webpack-hot-middleware/client?path=/__webpack_hmr&timeout=20000&reload=true`;
module.exports = {
    target: 'web',
    context: __dirname,
    output: {
        path: path.join(__dirname, 'dist'),
        publicPath: '/',
        filename: `./[name].bundle.${process.env.VERSION}.js`,
        crossOriginLoading: 'anonymous',
    },
    node: {
        url: true
    },
    externals: {
        window: 'window'
    },
    entry: {
        'default': [
            'bootstrap/dist/css/bootstrap.min.css',
            'argon-design-system-free/assets/css/argon.css',
        ],
        'survey': [
            '@babel/polyfill',
            hmwScript,
            './public/stylesheets/style.css',
            './src/index.ts',
        ],
        'quota': [
            '@babel/polyfill',
            hmwScript,
            './src/quota.ts',
        ],
        'quotaView': [
            '@babel/polyfill',
            hmwScript,
            './src/quotaView.ts',
        ],
        'login': [
            '@babel/polyfill',
            hmwScript,
            './src/login.ts',
        ],
        'router': [
            '@babel/polyfill',
            hmwScript,
            './src/router.ts',
        ],
        'report': [
            '@babel/polyfill',
            hmwScript,
            './src/report.ts',
        ],
        'fieldWorkView': [
            '@babel/polyfill',
            hmwScript,
            './src/fieldWorkView.ts',
        ],
        'topMenu': [
            'bootstrap/js/dist/dropdown.js',
            './src/topMenu.ts'
        ]
    },
    resolve: {
        extensions: [".ts", ".tsx", ".js"]
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                include: path.join(__dirname),
                exclude: /(node_modules)|(dist)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env']
                    }
                }
            },
            {
                test: /\.ejs$/,
                exclude: /node_modules/,
                use: 'raw-loader'
                /*
                use: {
                    loader: "ejs-loader?evaluate=\\[\\[(.+?)\\]\\]",
                    //loader: "ejs-loader"
                    // options: {
                    //     interpolate: '\\{\\{(.+?)\\}\\}',
                    //     evaluate: '\\[\\[(.+?)\\]\\]'
                    // },
                }*/
            },
            {
                test: /\.css$/,
                //use: ['style-loader', 'css-loader']
                use: [{
                    loader: MiniCssExtractPlugin.loader,
                    options:{}
                },'css-loader']
            },
            {
                test: /\.tsx?$/, loader: ["babel-loader","ts-loader"], exclude: "/node_modules/"
            },
        ]
    },
    plugins: [
        new webpack.ProvidePlugin({
            _: "underscore"
        }),
        //new webpack.HotModuleReplacementPlugin(),
        new MiniCssExtractPlugin({
            // Options similar to the same options in webpackOptions.output
            // both options are optional
            filename: "[name].css",
            chunkFilename: "[name].css"
        }),
        new HtmlWebpackPlugin({
            title: 'Error',
            filename: './views/error.ejs',
            template: "./views/error.ejs",
            inject: 'head',
            alwaysWriteToDisk: true,
            chunks: ['default'],
            minify: {
                removeComments: true,
                collapseWhitespace: true,
                removeRedundantAttributes: true,
                useShortDoctype: true,
                removeEmptyAttributes: true,
                removeStyleLinkTypeAttributes: true,
                keepClosingSlash: true,
                minifyJS: true,
                minifyCSS: true,
                minifyURLs: true
            },
            meta: {
                'viewport': 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no'
            }
        }),
        new HtmlWebpackPlugin({
            title: 'Survey',
            filename: './views/index.ejs',
            template: "./views/index.ejs",
            inject: 'body',
            alwaysWriteToDisk: true,
            chunks: ['default', 'survey'],
            minify: {
                removeComments: true,
                collapseWhitespace: true,
                removeRedundantAttributes: true,
                useShortDoctype: true,
                removeEmptyAttributes: true,
                removeStyleLinkTypeAttributes: true,
                keepClosingSlash: true,
                minifyJS: true,
                minifyCSS: true,
                minifyURLs: true
            },
            meta: {
                'viewport': 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no'
            }
        }),
        new HtmlWebpackPlugin({
            title: 'Router',
            filename: './views/router.ejs',
            template: "./views/router.ejs",
            inject: 'body',
            alwaysWriteToDisk: true,
            chunks: ['default','router'],
            minify: {
                removeComments: true,
                collapseWhitespace: true,
                removeRedundantAttributes: true,
                useShortDoctype: true,
                removeEmptyAttributes: true,
                removeStyleLinkTypeAttributes: true,
                keepClosingSlash: true,
                minifyJS: true,
                minifyCSS: true,
                minifyURLs: true
            },
            meta: {
                'viewport': 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no'
            }
        }),
        new HtmlWebpackPlugin({
            title: 'Quota',
            filename: './views/quota.ejs',
            template: "./views/quota.ejs",
            inject: 'body',
            alwaysWriteToDisk: true,
            chunks: ['default','quota'],
            minify: {
                removeComments: true,
                collapseWhitespace: true,
                removeRedundantAttributes: true,
                useShortDoctype: true,
                removeEmptyAttributes: true,
                removeStyleLinkTypeAttributes: true,
                keepClosingSlash: true,
                minifyJS: true,
                minifyCSS: true,
                minifyURLs: true
            },
            meta: {
                'viewport': 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no'
            }
        }),
        /*
        new HtmlWebpackPlugin({
            title: 'Quota',
            filename: './views/quotaView.ejs',
            template: "./views/quotaView.ejs",
            inject: 'body',
            alwaysWriteToDisk: true,
            chunks: ['default','quotaView'],
            minify: {
                removeComments: true,
                collapseWhitespace: true,
                removeRedundantAttributes: true,
                useShortDoctype: true,
                removeEmptyAttributes: true,
                removeStyleLinkTypeAttributes: true,
                keepClosingSlash: true,
                minifyJS: true,
                minifyCSS: true,
                minifyURLs: true
            },
            meta: {
                'viewport': 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no'
            }
        }),        */
        new HtmlWebpackPlugin({
            title: 'Login',
            filename: './views/login.ejs',
            template: "./views/login.ejs",
            inject: 'body',
            xhtml: true,
            alwaysWriteToDisk: true,
            chunks: ['default','login'],
            minify: {
                removeComments: true,
                collapseWhitespace: true,
                conservativeCollapse: true
            },
            meta: {
                'viewport': 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no'
            }
        }),
        new HtmlWebpackPlugin({
            title: 'Report',
            filename: './views/report.ejs',
            template: "./views/report.ejs",
            inject: 'body',
            alwaysWriteToDisk: true,
            chunks: ['default','report'],
            minify: {
                removeComments: true,
                collapseWhitespace: true,
                removeRedundantAttributes: true,
                useShortDoctype: true,
                removeEmptyAttributes: true,
                removeStyleLinkTypeAttributes: true,
                keepClosingSlash: true,
                minifyJS: true,
                minifyCSS: true,
                minifyURLs: true
            },
            meta: {
                'viewport': 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no'
            }
        }),
        new HtmlWebpackPlugin({
            title: 'TopMenu',
            filename: './views/includes/topMenu.ejs',
            template: "./views/includes/topMenu.ejs",
            inject: 'body',
            xhtml: true,
            alwaysWriteToDisk: true,
            chunks: ['topMenu'],
            minify: {
                removeComments: true,
                collapseWhitespace: true,
                conservativeCollapse: true
            },
            meta: {
                'viewport': 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no'
            }
        }),
        new HtmlWebpackPlugin({
            title: 'FieldWorkView',
            filename: './views/fieldWorkView.ejs',
            template: "./views/fieldWorkView.ejs",
            inject: 'body',
            xhtml: true,
            chunks: ['default', 'fieldWorkView'],
            alwaysWriteToDisk: true,
            minify: {
                removeComments: true,
                collapseWhitespace: true,
                conservativeCollapse: true
            },
            meta: {
                'viewport': 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no'
            }
        }),
        new SriPlugin({
            hashFuncNames: ['sha256', 'sha512'],
            enabled: process.env.NODE_ENV === 'production',
        }),
    ]
};