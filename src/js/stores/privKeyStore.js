import Reflux from 'reflux';
import _ from 'lodash';

var privKeyActions = require('actions/privKeyActions');
var commonActions = require('actions/commonActions');
var uiActions = require('actions/uiActions');
var bitcore = require('bitcore');
var config = require('config');

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
    privKeyActions.updateBalances(this.privKeys.map(function(obj) {
      return obj.address;
    }));
  },
  onDeletePrivKey: function(privKey) {
    this.updatePrivKeyList(this.privKeys.filter(function(obj){
      return obj.privKey !== privKey;
    }));
  },
  onUpdateBalances: function() {
    this.updatePrivKeyList(this.privKeys.map(function(obj) {
      obj.balance = null;

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
  // this will be called by all listening components as they register their listeners
  getInitialPrivKeys: function() {
    var loadedKeys = localStorage.getItem(localStorageKey);

    this.privKeys = !loadedKeys ? [] : JSON.parse(loadedKeys);

    return this.privKeys;
  }
});

module.exports = privKeyStore;