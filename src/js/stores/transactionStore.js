var Reflux = require('reflux');
var _ = require('lodash');

var transactionActions = require('actions/transactionActions');

var transactionStore = Reflux.createStore({

  store: {},

  resetStore: function() {
    this.store = {
      fetchingInitial: false,
      address: null,
      nextRange: null,
      transactions: {},
      updateAvailable: false
    };
  },

  // Initial setup
  init: function() {
    this.listenToMany(transactionActions);
  },

  onFetchTransactions: function(address, isInitial) {
    // If this is an initial fetch, reset the store to remove old transactions, if need be
    if (isInitial) {
      this.resetStore();
      this.store.fetchingInitial = isInitial;
      this.store.address = address;
    }

    this.trigger(this.store);
  },

  onFetchTransactionsCompleted: function(transactions, nextRange) {
    // New transactions overwrite old ones
    console.log('inside initial fetch completed');
    this.store.transactions = _.assign(this.store.transactions, transactions);
    
    this.store.fetchingInitial = false;
    this.store.nextRange = nextRange;

    this.trigger(this.store);
  },

  onFetchMoreTransactionsCompleted: function(transactions, nextRange) {
    this.store.transactions = _.assign(this.store.transactions, transactions);
    this.store.nextRange = nextRange;

    this.trigger(this.store);
  },

  getStore: function() {
    return this.store;
  }
});

module.exports = transactionStore;