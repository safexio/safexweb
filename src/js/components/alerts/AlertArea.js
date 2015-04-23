var React = require('react');

var spendStore = require('stores/spendStore');
var spendActions = require('actions/spendActions');
var spendActions = require('actions/spendActions');

var AlertArea = React.createClass({

  getInitialState: function() {
    return spendStore.getStore();
  },

  componentDidMount: function() {
    this.unsubscribe = spendStore.listen(this._setStore);
  },
  componentWillUnmount: function() {
    this.unsubscribe();
  },
  _setStore: function(spendStore) {
    this.setState({
      broadcastingTransactions: spendStore.broadcastingTransactions
    });
  },
  _removeBroadcastedTransaction: function(e) {
    var serialized = e.target.getAttribute('data-serialized');

    spendActions.clearBroadcast(serialized);
  },
  _rebroadcast: function(e) {
    var serialized = e.target.getAttribute('data-serialized');
    var address = e.target.getAttribute('data-address');

    // Remove existing one
    spendActions.clearBroadcast(serialized);
    spendActions.broadcastTransaction(serialized, address);
  },

  render: function() {
    var alerts = [];

    this.state.broadcastingTransactions.forEach(function(obj) {
      var className = 'alert', message, close;

      if (obj.status === 'broadcasting') {
        className += ' alert-info';
        message = 'Your transaction for address ' + obj.address + ' is broadcasting.';
      } else if (obj.status === 'failed') {
        className += ' alert-danger';
        message = <span>Your transaction for address {obj.address} failed to broadcast. <a style={{cursor: 'pointer'}} onClick={this._rebroadcast} data-address={obj.address} data-serialized={obj.serialized}>Click here to try again.</a></span>;
        close = <button onClick={this._removeBroadcastedTransaction} type="button" className="close" data-address={obj.serialized}>&times;</button>;
      } else if (obj.status === 'broadcasted') {
        className += ' alert-success alert-dismissible';
        message = 'Your transaction for address ' + obj.address + ' has successfully been broadcasted.';
        close = <button onClick={this._removeBroadcastedTransaction} type="button" className="close" data-serialized={obj.serialized}>&times;</button>;
      }

      var alert = (
        <div key={obj.address} className={className} role="alert">{close}{message}</div>
      )

      alerts.push(alert);
    }.bind(this));

    return <div>{alerts}</div>;
  }
});

module.exports = AlertArea;