var Reflux = require('reflux');
var bitcore = require('bitcore');
var commonActions = require('./commonActions');
var blockchainFetcher = require('utils/blockchainFetcher');
var config = require('config');

var Actions = Reflux.createActions({
  "fetchTransactions": {children: ['completed', 'failed']}
});

// Supply an array of addresses to get their balances
Actions.fetchTransactions.listen(function(address, nextRange) {
  var promise = blockchainFetcher.transactions(address, nextRange)
    .done(this.completed)
    .fail(this.failed);
});

// Don't continue with failed propagation. Just handle error.
Actions.fetchTransactions.failed.shouldEmit = function() {
  commonActions.error('There was a problem fetching transactions.');
  console.log('An error occurred while fetching transactions for address:', arguments);
  return false;
};

// Extract only the data we need: {address: balance, ...}
Actions.fetchTransactions.completed.preEmit = function(data, message, response) {
  // Create an array of transaction objects
  var transactions = data.map(function(obj) {
    var transaction = {};
    transaction.confirmations = obj.confirmations;
    transaction.hash = obj.hash;
    transaction.amount = obj.amount;
    transaction.time = obj.chain_received_at;
    transaction.inputs = obj.inputs.map(function(input) {
      return {
        addresses: input.addresses,
        amount: input.value
      };
    });
    transaction.outputs = obj.outputs.map(function(output) {
      return {
        addresses: output.addresses,
        amount: output.value,
        spent: output.spent
      };
    });
    
    return transaction;
  });
  
  return {transactions, nextRange: response.getResponseHeader('Next-Range')};
};

module.exports = Actions;