var Reflux = require('reflux'),
  bitcore = require('bitcore'),
  commonActions = require('./commonActions'),
  blockchainFetcher = require('utils/blockchainFetcher'),
  config = require('config');

function formatTransactions(data) {
  // Create an object of transaction objects
  var transactions = {};

  data.forEach(function(obj) {
    var transaction = {};
    transaction.confirmations = obj.confirmations;
    transaction.hash = obj.hash;
    transaction.amount = obj.amount;
    transaction.time = +Date.parse(obj.chain_received_at);
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

    transactions[transaction.hash] = transaction;
  });
  
  return transactions;
}

var Actions = Reflux.createActions({
  "fetchTransactions": {children: ['completed', 'failed']},
  "fetchMoreTransactions": {children: ['completed', 'failed']}
});

// Supply an address to get its transactions
Actions.fetchTransactions.listen(function(address) {
  var promise = blockchainFetcher.transactions(address)
    .done(this.completed)
    .fail(this.failed);
});

Actions.fetchTransactions.failed.listen(function() {
  commonActions.error('There was a problem fetching transactions.');
});

// Extract only the data we need: {address: balance, ...}
Actions.fetchTransactions.completed.preEmit = function(data, message, response) {
  var transactions = formatTransactions(data);

  return [transactions, response.getResponseHeader('Next-Range')];
};

// Supply an address and the nextRange to get more transactions
Actions.fetchMoreTransactions.listen(function(address, nextRange) {
  var promise = blockchainFetcher.transactions(address, nextRange)
    .done(this.completed)
    .fail(this.failed);
});

Actions.fetchMoreTransactions.failed.listen(function() {
  commonActions.error('There was a problem fetching more transactions.');
});

// Extract only the data we need: {address: balance, ...}
Actions.fetchMoreTransactions.completed.preEmit = function(data, message, response) {
  var transactions = formatTransactions(data);

  return [transactions, response.getResponseHeader('Next-Range')];
};

module.exports = Actions;