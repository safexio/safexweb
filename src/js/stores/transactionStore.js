var Reflux = require('reflux');
var _ = require('lodash');

var transactionActions = require('actions/transactionActions');

var transactionStore = Reflux.createStore({

  store: {
    fetching: false,
    address: null,
    nextRange: null,
    transactions: []
  },

  // Initial setup
  init: function() {
    this.listenToMany(transactionActions);
  },

  onFetchTransactions: function(address, nextRange) {
    this.store.fetching = true;
    this.store.address = address;

    // If nextRange wasn't provided, this means we're fetching initial transactions so reset existing ones.
    // If nextRange is provided, it means we're just fetching more transactions.
    if (!nextRange) {
      this.store.transactions = [];
      this.store.nextRange = null;
    }

    this.trigger(this.store);
  },

  onFetchTransactionsCompleted: function(obj) {
    this.store.fetching = false;
    this.store.transactions = this.store.transactions.concat(obj.transactions);
    this.store.nextRange = obj.nextRange;

    this.trigger(this.store);
  },

  getStore: function() {
    return this.store;
  }
});

module.exports = transactionStore;