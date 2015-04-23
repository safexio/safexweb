import React from 'react';

var PrivKeyImport = require('./PrivKeyImport');
var PrivKeyTable = require('./PrivKeyTable');
var privKeyActions = require('actions/privKeyActions');

var PrivKeyBox = React.createClass({
  _generateNewKeypair: function() {
    privKeyActions.addPrivKey();
  },
  render: function() {

    var button = <button onClick={this._generateNewKeypair} className="btn btn-warning btn-xs" type="input" style={{float: 'right' }}>Generate New Keypair</button>;

    return (
      <div className="panel panel-default">
        <div className="panel-heading">Bitcoin Private Keys {button}</div>
        <div className="panel-body">
          <PrivKeyImport />
          <PrivKeyTable />
    </div>
      </div>
    );
  }
});

module.exports = PrivKeyBox;