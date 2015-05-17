var Reflux = require('reflux'),
  _ = require('lodash'),
  uiActions = require('actions/uiActions');

var uiStore = Reflux.createStore({

  ui: {
    privKey: {
      clearInput: false
    }
  },

  init: function() {
    this.listenToMany(uiActions);
  },

  onClearPrivKeyInput: function() {
    this.ui.privKey.clearInput = true;
    this.trigger(this.ui);
    this.ui.privKey.clearInput = false;
  },

  getStore: function() {
    return this.ui;
  }

});

module.exports = uiStore;