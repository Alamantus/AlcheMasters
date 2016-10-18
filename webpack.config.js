const path = require('path');
const webpack = require('webpack');

const BUILD_DIR = path.resolve(__dirname, '../gh-pages');
const APP_DIR = path.resolve(__dirname, 'src');

const phaserModule = path.join(__dirname, 'node_modules/phaser/');
const phaser = path.join(phaserModule, 'build/custom/phaser-split.js'),
      pixi = path.join(phaserModule, 'build/custom/pixi.js'),
      p2 = path.join(phaserModule, 'build/custom/p2.js');

 module.exports = {
    entry: APP_DIR + '/index.js',
    output: {
      path: BUILD_DIR,
      filename: 'game.js'
    },
    module: {
      loaders: [
        {
          test: /\.html?$/,
          exclude: /node_modules/,
          loaders: [
                    'file?name=[name].html',
                    'html-minify'
                  ]
        },
        {
          test: /\.scss$/,
          exclude: /node_modules/,
          loaders: ['style', 'css', 'sass']
        },
        {
          test: /(pixi\.js|phaser|p2)/,
          loader: 'script'
        },
        {
          test: /\.js$/,
          exclude: /node_modules/,
          loader: 'babel',
          query: {
            presets: ['es2015']
          }
        },
        {
          test: /\.(jpg|png)$/,
          loaders: [
                    'url?limit=25000?name=images/[name].[ext]?[hash]',
                    'img?progressive=true&optimizationLevel=5'
                  ]
        }
      ]
    },
    resolve: {
      extensions: ['', '.js'],
      alias: {
        'phaser': phaser,
        'pixi.js': pixi,
        'p2': p2
      }
    },
    // Turn on optimization plugin for prod, leave off for dev
    // plugins: [
    //   new webpack.optimize.UglifyJsPlugin({
    //     compress: {
    //       warnings: false
    //     },
    //     output: {
    //       comments: false
    //     }
    //   })
    // ],
    sassLoader: {
      file: './src/sass/main.scss',
      outputStyle: 'compressed'
    }
 };
