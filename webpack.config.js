var path = require('path');
var webpack = require('webpack');
var AotPlugin = require('@ngtools/webpack').AngularCompilerPlugin;
var commonsChunkPlugin = webpack.optimize.CommonsChunkPlugin;
var providePlugin = webpack.ProvidePlugin;

var commonConfig = {
    entry: {
        'app': path.join(__dirname,'./src/client/main.ts'),
        'vendor': path.join(__dirname,'./src/client/vendor.ts'),
    },
    output: {
        filename: '[name].min.js',
        path: path.join(__dirname, 'dist/client')
    },
    resolve: {
        extensions: ['.ts', '.js', '.json']
    },
    devtool: 'source-map',
    module: {
        rules: [
            {
                enforce: 'pre',
                test: /\.ts$/,
                use: 'source-map-loader'
            },
            {
                test: /(?:\.ngfactory\.js|\.ngstyle\.js|\.ts)$/,
                loader: '@ngtools/webpack'
            },
            {
                test: /\.scss$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: 'raw-loader'
                    },
                    {
                        loader:'sass-loader',
                        options: {
                            outputStyle: 'compressed'
                        }
                    }
                ]
            },
            {
                test: /\.(html|css)$/,
                loader: 'raw-loader'
            },
        ]
    },
    plugins: [
        new AotPlugin({
            tsConfigPath: path.join(__dirname, './src/client/tsconfig.json'),
            mainPath: path.join(__dirname, './src/client/main.ts'),
            gendir: path.join(__dirname, './aot')
        }),
        new providePlugin({
            $: 'jquery',
            jQuery: 'jquery',
            'window.$': 'jquery',
            'window.jQuery': 'jquery',
            'window.jquery': 'jquery',
            Tether: 'tether',
            'window.Tether': 'tether',
            Popper: ['popper.js', 'default'],
        }),
        new commonsChunkPlugin({
            name: 'common',
            minChunks: 2
        })
    ]
};

module.exports = commonConfig;
