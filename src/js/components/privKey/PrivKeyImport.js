import React from 'react';

var privKeyActions = require('actions/privKeyActions');
var uiStore = require('stores/uiStore');

var PrivKeyImport = React.createClass({

  getInitialState: function() {
    return uiStore.getStore();
  },

  _addPrivKey: function(e) {
    e.preventDefault();

    var privKeyEl = this.refs.privKeyInput.getDOMNode();

    var input = privKeyEl.value.trim();
    if (!input) {
      return;
    } else {
      privKeyActions.addPrivKey(privKeyEl.value.trim());
    }
  },

  componentDidMount: function() {
    this.unsubscribe = uiStore.listen(this._clearInput);
  },

  componentWillUnmount: function() {
    this.unsubscribe();
  },

  _clearInput: function(uiState) {
    if (uiState.privKey.clearInput) {
      this.refs.privKeyInput.getDOMNode().value = '';
    }
  },

  render: function() {
    return (
      <form onSubmit={ this._addPrivKey }>
        <div className="input-group margin-bottom">
            <input type="text" className="form-control" placeholder="Import bitcoin private key" ref="privKeyInput" />
            <span className="input-group-btn">
              <button className="btn btn-success" type="submit">Import</button>
            </span>
        </div>
      </form>
    );
  }
});

module.exports = PrivKeyImport;