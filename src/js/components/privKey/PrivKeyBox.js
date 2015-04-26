import React from 'react';

var PrivKeyImport = require('./PrivKeyImport');
var PrivKeyTable = require('./PrivKeyTable');
var privKeyActions = require('actions/privKeyActions');

var PrivKeyBox = React.createClass({
  _generateNewKeypair: function() {
    privKeyActions.addPrivKey();
  },
  render: function() {

    var button = <button onClick={this._generateNewKeypair} className="btn btn-warning btn-xs pull-right" type="input">Generate <span className="hidden-xs">New </span>Keypair</button>;

    return (
      <div className="panel panel-default">
        <div className="panel-heading"><span className="hidden-xs">Bitcoin </span>Private Keys {button}</div>
        <div className="panel-body">
          <PrivKeyImport />
          <PrivKeyTable />
    </div>
      </div>
    );
  }
});

module.exports = PrivKeyBox;