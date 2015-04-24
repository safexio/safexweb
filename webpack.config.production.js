var webpack = require('webpack');

module.exports = {
  entry: [
    "./src/js/app.js"
  ],
  output: {
    path: __dirname + '/build',
    filename: "bundle.js"
  },
  module: {
    loaders: [
      {test: /\.jsx?$/, loaders: ['babel'], exclude: /node_modules/},
      {test: /\.js$/, exclude: /node_modules/, loader: 'babel-loader'},
      {test: /\.json$/, loader: "json"},
      {test: /\.css$/, loader: "style!css"},
      {test: /\.html$/, loader: "file-loader"}
    ]
  },
  resolve: {
    modulesDirectories: ["web_modules", "node_modules", "js"]
  },
  plugins: [
    new webpack.optimize.UglifyJsPlugin({minimize: true})
  ]

};