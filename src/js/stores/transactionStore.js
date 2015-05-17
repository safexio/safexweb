var Reflux = require('reflux'),
  _ = require('lodash'),
  privKeyStore = require('stores/privKeyStore'),
  transactionActions = require('actions/transactionActions');

var transactionStore = Reflux.createStore({

  store: {},

  fetchedLatestTransactionsAt: null,

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
    this.resetStore();

    this.listenToMany(transactionActions);

    // Listen to changes in the privKeyStore
    this.listenTo(privKeyStore, this.privKeyStoreUpdated);
  },

  privKeyStoreUpdated: function(privKeyStore) {
    if (!this.store.address) return;

    // Find the privKey with this address
    var privKey = _.find(privKeyStore, function(privKey) {
      return privKey.address == this.store.address;
    }, this)

    // If priv key was not found or no balance updated
    if (!privKey || !privKey.balanceLastUpdated) return;

    // If never fetched latest transactions, or balance was updated after the last fetch, fetch them.
    if (!this.fetchedLatestTransactionsAt || this.fetchedLatestTransactionsAt < privKey.balanceLastUpdated) {
      transactionActions.fetchTransactions(this.store.address);
    }
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
    this.store.transactions = _.assign(this.store.transactions, transactions);
    
    this.store.fetchingInitial = false;
    this.store.nextRange = nextRange;

    this.fetchedLatestTransactionsAt = +Date.now();

    this.trigger(this.store);
  },

  /**
   * When we fetch MORE transactions (due to limits in the api to fetch all transactions).
   * We don't set fetchedLatestTransactionsAt here because this isn't getting new transactions.
   *
   * @param transactions
   * @param nextRange
   */
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