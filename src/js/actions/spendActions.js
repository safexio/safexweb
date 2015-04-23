var Reflux = require('reflux');
var UnspentOutput = require('bitcore').Transaction.UnspentOutput;
var commonActions = require('./commonActions');
var uiActions = require('./uiActions');
var blockchainFetcher = require('utils/blockchainFetcher');
var config = require('config');

var Actions = Reflux.createActions({
  "fetchUtxos": {children: ['completed', 'failed']},
  // Note the below "failure" vs the usual "failed". Reflux has a bug where
  // using "failed" in the particular case wouldn't catch an exception. Not sure why.
  "broadcastTransaction": {children: ['completed', 'failure']},
  "clearBroadcast": {}
});

var serializedTxBeingBroadcasted = null;

// Broadcast a transaction
Actions.broadcastTransaction.listen(function(serializeTransaction, address) {
  serializedTxBeingBroadcasted = serializeTransaction;

  var promise = blockchainFetcher.broadcast(serializeTransaction)
    .done(this.completed)
    .fail(this.failure); // "failure" vs "failed" -- see note above
});

// Handle error.
Actions.broadcastTransaction.failure.preEmit = function() {
  var serialized = serializedTxBeingBroadcasted;
  serializedTxBeingBroadcasted = null;

  commonActions.error('There was a problem broadcasting your transaction. Please try again later.');
  console.log('An error occurred while broadcasting your transaction:', arguments);

  return [serialized];
};

// Extract only the data we need
Actions.broadcastTransaction.completed.preEmit = function(data) {
  var serialized = serializedTxBeingBroadcasted;
  serializedTxBeingBroadcasted = null;

  return [serialized, data.transaction_hash];
};

// Supply an array of addresses to get their balances
Actions.fetchUtxos.listen(function(privKey) {
  var promise = blockchainFetcher.utxos(privKey.address)
    .done(this.completed)
    .fail(this.failed);
});

// Don't continue with failed propagation. Just handle error.
Actions.fetchUtxos.failed.shouldEmit = function() {
  commonActions.error('There was a problem fetching unspent utxos.');
  console.log('An error occurred while fetching utxos for address:', arguments);
  return false;
};

// Extract only the data we need: {address: balance, ...}
Actions.fetchUtxos.completed.preEmit = function(data) {
  var utxos = [],
    spendable = 0,
    multiSigUtxos = 0;

  // Create an array of utxo objects
  data.forEach(function(obj) {
    // Some validation
    if (obj.confirmations == 0 || obj.spent !== false) {
      return;
    } else if (obj.addresses.length > 1) {
      // We currently do not support spending from multisig. sorry!
      multiSigUtxos++;
      return;
    }

    // Create a new bitcoin UnspentOutput instance
    try {
      var utxo = new UnspentOutput({
        txid: obj.transaction_hash,
        outputIndex: obj.output_index,
        satoshis: obj.value,
        address: obj.addresses[0],
        scriptPubKey: obj.script_hex
      });
    } catch (error) {
      commonActions.error('Received an error when creating new utxo object: '+ error);
      return;
    }

    // Add spendable amount
    spendable += obj.value;

    // Add it to our lsit
    utxos.push(utxo);
  });

  return [utxos, spendable];
};

module.exports = Actions;