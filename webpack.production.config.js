const webpack = require('webpack');
const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  devtool: 'cheap-source-map',
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
    new webpack.optimize.DedupePlugin(),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production')
      }
    }),
    new CopyWebpackPlugin([
      { from: './app/index.html', to: 'index.html' },
      { from: './app/main.css', to: 'main.css' }
    ])
  ]
};
