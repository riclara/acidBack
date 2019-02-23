var path = require('path')
var nodeExternals = require('webpack-node-externals')
const NodemonPlugin = require('nodemon-webpack-plugin')

let wpc = {
  target: 'node',
  externals: [nodeExternals()],
  entry: './server/app.js',
  // devtool: '#eval',
  devtool: 'source-map',

  output: {
    path: path.resolve(__dirname, './dist'),
    publicPath: '/dist/',
    filename: 'build.js'
  },

  module: {
    rules: [
      {
        test: /\.(js)$/,
        loader: 'eslint-loader',
        enforce: 'pre',
        include: [path.resolve(__dirname, './server')]
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './server')
    }
  },
  plugins: [
    new NodemonPlugin({
      nodeArgs: ['--inspect=0.0.0.0:9227']
    })
  ]
}

module.exports = wpc
