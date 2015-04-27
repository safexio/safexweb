# SafeX Web

## Warning! This is alpha-level software. Use at your own risk.

SafeX Web is the website version SafeX Client to be powered by the SAFE network. Some of the technologies used: React, React Router, Bitcore, Flux (using the Reflux implementation), Webpack, and Sass

### Installation

Run `sudo npm install`.

### Running

Run `npm start` from the project root to start a local server and visit `http://localhost:8080` in your browser.

### Developers

Compiling css and javascript files: `gulp build`
 
Run a local server with hot code reloading: `npm start` and visit `http://localhost:8080/webpack-dev-server/` in the browser.

Use `gulp watch` to watch for css changes.

By default the config is set to use the testnet. Testnet Mycelium Wallet for Android is a good way to create individual keys and import them into this wallet, should you choose to use that feature.