const webpack = require('webpack');
const path = require('path');
const OpenBrowserPlugin = require('open-browser-webpack-plugin');

module.exports = {
  devServer: {
    historyApiFallback: true,
    inline: true,
    progress: true,
    contentBase: './app',
    port: 8080
  },
  entry: [
    path.resolve(__dirname, 'app/main.jsx')
  ],
  output: {
    path: path.resolve(__dirname, 'app/bundle'),
    publicPath: '/',
    filename: './bundle.js'
  },
  module: {
    rules: [
      { test: /\.css$/, include: path.resolve(__dirname, 'app'), use: ['style-loader', 'css-loader'] },
      { test: /\.scss$/, include: [path.resolve(__dirname, 'app') ], use: ['style-loader', 'css-loader', 'sass-loader'] },
      { test: /\.js[x]?$/, include: path.resolve(__dirname, 'app'), exclude: /node_modules/, use: 'babel-loader' },
      { test: /\.json?$/, include: path.resolve(__dirname, 'config'), use: 'json-loader' },
      {
        test: /\.(png|jp(e*)g|svg)$/, include: path.resolve(__dirname, 'images'),
        use: [{
          loader: 'url-loader',
          options: {
            limit: 8000, // Convert images < 8kb to base64 strings
            name: 'images/[hash]-[name].[ext]'
          }
        }]
      },
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx', 'json', '.scss']
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new OpenBrowserPlugin({ url: 'http://localhost:3000' })
  ],
  node: {
    fs: 'empty',
    net: 'empty',
    tls: 'empty'
  }
};
