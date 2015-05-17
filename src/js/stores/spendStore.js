var Reflux = require('reflux'),
  spendActions = require('actions/spendActions'),
  privKeyStore = require('stores/privKeyStore'),
  transactionCalculator = require('utils/transactionCalculator');

var spendStore = Reflux.createStore({

  fetchedLatestUtxosAt: null,

  store: {
    fetching: false,
    privKey: null,
    spendable: 0,
    fee: 0,
    utxos: [],
    broadcastingTransactions: []
  },

  // Initial setup
  init: function() {
    this.listenToMany(spendActions);

    // Listen to changes in the privKeyStore and update spendable amount if necessary
    this.listenTo(privKeyStore, this.privKeyStoreUpdated);
  },

  privKeyStoreUpdated: function(privKeyStore) {
    if (!this.store.privKey) return;

    // Find the privKey with this address
    var privKey = _.find(privKeyStore, function(privKey) {
      return privKey.address == this.store.privKey.address;
    }, this)

    // If priv key was not found or no balance updated
    if (!privKey || !privKey.balanceLastUpdated) return;

    // If never fetched latest transactions, or balance was updated after the last fetch, fetch them.
    if (!this.fetchedLatestUtxosAt || this.fetchedLatestUtxosAt < privKey.balanceLastUpdated) {
      spendActions.fetchUtxos(this.store.privKey);
    }
  },

  onFetchUtxos: function(privKey) {
    this.store.fetching = true;
    this.store.privKey = privKey;
    this.store.spendable = 0;
    this.store.fee = 0;
    this.store.utxos = [];

    this.trigger(this.store);
  },

  onFetchUtxosCompleted: function(utxos, spendable) {
    this.store.fetching = false;
    this.store.utxos = utxos;

    // Now that we have the utxos, we can get the max spendable amount
    // which will be the spendable amount (confirmed balance - multisig input total) - fee
    if (spendable > 0) {
      spendable = transactionCalculator.MaxSpend(
        utxos.length,
        spendable
      );
      
      this.store.spendable = Math.max(0, spendable);
    } else {
      this.store.spendable = 0;
    }

    this.trigger(this.store);
  },

  onBroadcastTransaction: function(serialized, address) {
    // Let's do a safety check and remove a broadcasting transaction with the same address (so as not to have two)
    var existingBroadcast = this.getBroadcastBySerialized(serialized);

    if (existingBroadcast) {
      this.store.broadcastingTransactions = _.filter(this.store.broadcastingTransactions, function(obj) {
        return obj.serialized !== serialized;
      });
    }

    this.store.broadcastingTransactions.push({
      address,
      serialized,
      status: 'broadcasting',
      txHash: null
    });

    this.trigger(this.store);
  },

  onBroadcastTransactionCompleted: function(serialized, txHash) {
    var broadcast = _.find(this.store.broadcastingTransactions, function(obj) {
      return obj.serialized === serialized;
    });

    if (broadcast) {
      broadcast.status = 'broadcasted';
      broadcast.txHash = txHash;
    }

    this.trigger(this.store);
  },

  onClearBroadcast: function(serialized)
  {
    this.store.broadcastingTransactions = _.filter(this.store.broadcastingTransactions, function(obj) {
      return obj.serialized !== serialized;
    });

    this.trigger(this.store);
  },

  onBroadcastTransactionFailure: function(serialized) {
    var broadcast = this.getBroadcastBySerialized(serialized);

    broadcast.status = 'failed';

    this.trigger(this.store);
  },

  getBroadcastBySerialized: function(serialized) {
    return _.find(this.store.broadcastingTransactions, function(obj) {
      return obj.serialized === serialized;
    });
  },

  getStore: function() {
    return this.store;
  }
});

module.exports = spendStore;