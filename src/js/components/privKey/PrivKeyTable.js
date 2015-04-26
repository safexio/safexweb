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

    this.debounce = _.debounce(this._setBlankState, 200);
    window.addEventListener('resize', this.debounce, false);
  },
  componentWillUnmount: function() {
    window.removeEventListener('resize', this.debounce, false);
    this.unsubscribe();
  },
  _setBlankState: function() {
    this.setState({});
  },
  _onPrivKeyListChange: function(privKeys) {
    this.setState({
      privKeys: privKeys
    });
  },
  _deletePrivKey: function(e) {
    var privKey = e.target.getAttribute('data-priv-key');

    if (confirm('You are about to permanently remove this private key from your wallet. Are you sure you wish to continue?')) {
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

      obj.added = Moment(obj.added).format('YYYY-MM-DD HH:mm:ss');

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
          <td className="hidden-xs">{keyObj.added}</td>
          <td className="privKey-col">
            <div className="visible-md visible-lg">
              {keyObj.privKey}
            </div>
            <div className="visible-sm">
              <div className="privKey-sm">{keyObj.privKey}</div>
            </div>
            <div className="visible-xs">
              <div className="privKey-xs">{keyObj.privKey}</div>
              <div><b>Added:</b> {keyObj.added}</div>
              <div><b>Total balance:</b> {keyObj.balance}</div>
              <div><b>Confirmed balance:</b> {keyObj.confirmedBalance}</div>
            </div>
          </td>
          <td className="hidden-xs">{keyObj.balance}</td>
          <td className="hidden-xs">{keyObj.confirmedBalance}</td>
          <td className="actions-col">
            <Link to="transactions" params={{address: keyObj.address}} className="btn btn-primary btn-xs">Explore</Link>
            <button className="btn btn-danger btn-xs" onClick={this._deletePrivKey} data-priv-key={keyObj.privKey}>Delete</button>
            <Link to="spend" params={{address: keyObj.address}} className="btn btn-success btn-xs">Spend</Link>
          </td>
        </tr>
      );
    }.bind(this));

    return (
      <table className="PrivKeyTable table table-striped table-hover">
        <thead>
          <tr>
            <th className="hidden-xs">Added</th>
            <th className="privKey-col"><span>Private Key</span></th>
            <th className="hidden-xs">Balance</th>
            <th className="hidden-xs">Confirmed</th>
            <th className="actions-col">Actions</th>
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