const path = require('path');

module.exports = {
  entry: './lib/index.es6',
  mode: 'production',
  resolve: {
    extensions: ['.js', '.es6']
  },
  node: {
    fs: "empty",
    tls: "empty",
    net: "empty"
  },
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname),
    library: 'RiskManagement',
    libraryTarget: 'umd',
    libraryExport: 'default'
  }
};
