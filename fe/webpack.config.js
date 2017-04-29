"use strict";
var webpack = require('webpack');
var path = require('path');

var loaders = [
  {
    test: /\.js$/,
    exclude: /(node_modules)/,
    loader: "babel-loader"
  }
];

module.exports = {
  entry: [
    './src/app.js',
  ],
  devtool: 'eval-source-map',
  output: {
    publicPath: '/',
    path: path.join(__dirname, '..', 'public'),
    filename: 'bundle.js'
  },
  resolve: {
    extensions: ['.js']
  },
  module: {
    loaders
  },
  plugins: []
};