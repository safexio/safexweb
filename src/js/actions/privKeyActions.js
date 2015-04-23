var Reflux = require('reflux');
var bitcore = require('bitcore');
var commonActions = require('./commonActions');
var privateKey = bitcore.PrivateKey;
var blockchainFetcher = require('utils/blockchainFetcher');
var config = require('config');

var Actions = Reflux.createActions({
  "addPrivKey": {},
  "deletePrivKey": {},
  "updateBalances": {children: ['completed', 'failed']}
});

// Supply an array of addresses to get their balances
Actions.updateBalances.listen(function(addresses) {
  if (addresses.length < 1) return;

  var promise = blockchainFetcher.addressBalances(addresses)
    .done(this.completed)
    .fail(this.failed);
});

// Don't continue with failed propagation. Just handle error.
Actions.updateBalances.failed.shouldEmit = function() {
  commonActions.error('There was a problem updating address balances.');
  console.log('An error occurred while fetching address balances:', arguments);
  return false;
};

// Extract only the data we need: {address: balance, ...}
Actions.updateBalances.completed.preEmit = function(addresses) {
  var addressMap = {};

  addresses.forEach(function(obj) {
    addressMap[obj.address] = {
      balance: obj.total.balance,
      confirmedBalance: obj.confirmed.balance
    };
  });

  return addressMap;
};

module.exports = Actions;