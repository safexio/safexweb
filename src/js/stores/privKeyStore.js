var Reflux = require('reflux'),
  _ = require('lodash'),
  privKeyActions = require('actions/privKeyActions'),
  commonActions = require('actions/commonActions'),
  uiActions = require('actions/uiActions'),
  bitcore = require('bitcore'),
  config = require('config'),
  blockchainWebsocket = require('utils/blockchainWebsocket');

// For now we will store everything in local storage
var localStorageKey = "privateKeys";

var privKeyStore = Reflux.createStore({
  // Initial setup
  init: function() {
    this.listenToMany(privKeyActions);
  },

  onAddPrivKey: function(privKey) {
    if (!privKey) {
      privKey = new bitcore.PrivateKey(null, config.network);
    } else {
      try {
        privKey = new bitcore.PrivateKey(privKey, config.network);
      } catch (e) {
        commonActions.error('Invalid private key: ' + e.message);
        return;
      }
    }

    if (this.storeHasPrivKey(privKey.toWIF())) {
      commonActions.error('This key has already been imported.');
      return;
    }

    var address = privKey.toPublicKey().toAddress().toString();

    this.updatePrivKeyList([{
      privKey: privKey.toWIF(),
      address: address,
      balance: null,
      confirmedBalance: null,
      added: +new Date()
    }].concat(this.privKeys));

    uiActions.clearPrivKeyInput();

    this.updateBalances(address);

    // Subscribe to this address
    this.subscribeAddress(address);
  },

  updateBalances: function(addresses) {
    privKeyActions.updateBalances(addresses ? addresses : this.getArrayOfAddresses());
  },

  getArrayOfAddresses: function() {
    return this.privKeys.map(function(obj) {
      return obj.address;
    });
  },

  onDeletePrivKey: function(privKey) {
    this.updatePrivKeyList(this.privKeys.filter(function(obj){
      return obj.privKey !== privKey;
    }));
  },

  onUpdateBalances: function(addresses) {
    this.updatePrivKeyList(this.privKeys.map(function(obj) {
      // If this privkey is in the list of updating balance addresses, set it to null
      if (addresses.indexOf(obj.address) > -1) {
        obj.balance = null;
      }

      return obj;
    }));
  },

  onUpdateBalancesCompleted: function(addressMap) {
    var privKeys = this.privKeys.map(function(obj) {
      if (addressMap.hasOwnProperty(obj.address)) {
        obj.balance = addressMap[obj.address].balance;
        obj.confirmedBalance = addressMap[obj.address].confirmedBalance;
      }

      return obj;
    });

    this.updatePrivKeyList(privKeys);
  },

  // called whenever we change the transactions list. normally this would mean a database API call
  updatePrivKeyList: function(privKeys){
    localStorage.setItem(localStorageKey, JSON.stringify(privKeys));

    // This is where we'd update the data in the db
    this.privKeys = privKeys;
    this.trigger(privKeys); // sends the updated list to all listening components
  },

  storeHasPrivKey: function(privKey) {
    return !!this.getByPrivKey(privKey);
  },

  getByPrivKey: function(privKey) {
    var obj = _.find(this.privKeys, function(obj) {
      return obj.privKey === privKey;
    });

    return obj;
  },

  storeHasAddress: function(address) {
    return !!this.getByAddress(address);
  },

  getByAddress: function(address) {
    var obj = _.find(this.privKeys, function(obj) {
      return obj.address === address;
    });

    return obj;
  },

  subscribeAddress: function(address) {
    blockchainWebsocket.subscribeAddress(address);
  },

  // this will be called by all listening components as they register their listeners
  loadInitialPrivKeys: function() {
    var loadedKeys = localStorage.getItem(localStorageKey);

    this.privKeys = !loadedKeys ? [] : JSON.parse(loadedKeys);

    this.updateBalances();

    // Subscribe the addresses for live updates
    this.subscribeAddress(this.getArrayOfAddresses());

    return this.privKeys;
  }
});

module.exports = privKeyStore;