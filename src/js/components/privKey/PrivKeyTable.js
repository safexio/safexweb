var React = require('react');
var Bitcore = require('bitcore');
var Link = require('react-router').Link;
var _ = require('lodash');
var Moment = require('moment');

var privKeyStore = require('stores/privKeyStore');
var privKeyActions = require('actions/privKeyActions');

var PrivKeyTable = React.createClass({
  contextTypes: {
    router: React.PropTypes.func
  },
  getInitialState: function() {
    return {
      privKeys: privKeyStore.getInitialPrivKeys()
    };
  },
  componentDidMount: function() {
    // Update address balances on load
    privKeyActions.updateBalances(this.state.privKeys.map(function(obj) {
      return obj.address;
    }));

    this.unsubscribe = privKeyStore.listen(this._onPrivKeyListChange);
  },
  componentWillUnmount: function() {
    this.unsubscribe();
  },
  _onPrivKeyListChange: function(privKeys) {
    this.setState({
      privKeys: privKeys
    });
  },
  _deletePrivKey: function(e) {
    var privKey = e.target.getAttribute('data-priv-key');

    if (confirm('You are about to permanantely remove this private key from your wallet. Are you sure you wish to continue?')) {
      privKeyActions.deletePrivKey(privKey);
      this.context.router.transitionTo('/');
    }
  },
  render: function() {
    var privKeys = _.clone(this.state.privKeys, true);

    // Convert all priv key balances to BTC
    var privKeys = privKeys.map(function(obj) {
      if (obj.balance !== null) {
        obj.balance = Bitcore.Unit.fromSatoshis(obj.balance).toBTC();
        obj.confirmedBalance = Bitcore.Unit.fromSatoshis(obj.confirmedBalance).toBTC();
      } else {
        obj.balance = '...';
        obj.confirmedBalance = '...';
      }

      return obj;
    });

    if (privKeys.length > 1)
    {
      privKeys.sort(function(a, b) {
        return b.added - a.added;
      });
    }

    var rows = privKeys.map(function(keyObj, index) {
      return (
        <tr key={keyObj.privKey}>
          <td className="hidden-xs hidden-sm">{Moment(keyObj.added).format('YYYY-MM-DD HH:mm:ss')}</td>
          <td>{keyObj.privKey}</td>
          <td className="hidden-xs hidden-sm">{keyObj.balance}</td>
          <td className="hidden-xs hidden-sm">{keyObj.confirmedBalance}</td>
          <td style={{whiteSpace: 'nowrap'}}>
            <Link to="transactions" params={{address: keyObj.address}} className="btn btn-primary btn-xs">Explore</Link>&nbsp;
            <button className="btn btn-danger btn-xs" onClick={this._deletePrivKey} data-priv-key={keyObj.privKey}>Delete</button>&nbsp;
            <Link to="spend" params={{address: keyObj.address}} className="btn btn-success btn-xs">Spend</Link>
          </td>
        </tr>
      );
    }.bind(this));

    return (
      <table className="table table-striped table-hover">
        <thead>
          <tr>
            <th className="hidden-xs hidden-sm">Added</th>
            <th><span style={{width:300, overflow: 'hidden', textOverflow: 'ellipsis'}}>Private Key</span></th>
            <th className="hidden-xs hidden-sm">Balance</th>
            <th className="hidden-xs hidden-sm">Confirmed</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows}
        </tbody>
      </table>
    );
  }
});

module.exports = PrivKeyTable;