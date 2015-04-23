var webpack = require('webpack');

module.exports = {
  entry: [
    'webpack/hot/only-dev-server',
    "./src/js/app.js"
  ],
  output: {
    path: __dirname + '/build',
    filename: "bundle.js"
  },
  module: {
    loaders: [
      {test: /\.js?$/, loaders: ['react-hot', 'babel'], exclude: /node_modules/},
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
    new webpack.NoErrorsPlugin()
  ]

};