# SafeX Web

## Warning! This is alpha-level software. Use at your own risk.

### Installation

Simply run `sudo npm install`. Copy the `config.default.js` file in `src/js` to `config.js` and enter your Chain.com public API key there.

Now just run `npm start` from the project root to start a local server and visit `http://localhost:8080` in your browser! Developers use `http://localhost:8080/webpack-dev-server/` instead to get live code reloading to save time.

By default the config is set to use the testnet. Testnet Mycelium Wallet for Android is a good way to create individual keys and import them into this wallet, should you choose to use that feature.