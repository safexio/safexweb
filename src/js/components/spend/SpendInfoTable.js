var React = require('react'),
  Unit = require('bitcore').Unit;

module.exports = React.createClass({
  render: function() {
    return (
      <div className="SpendInfoTable">
        <table className="table table-striped table-hover">
          <tbody>
          <tr>
            <td>Send from address</td>
            <td>{this.props.privKey.address}</td>
          </tr>
          <tr>
            <td>Confirmed balance:</td>
            <td>{Unit.fromSatoshis(this.props.privKey.confirmedBalance).toBTC()} BTC</td>
          </tr>
          <tr>
            <td><abbr title="Total amount you can spend from this address, which takes into account the mining fee, unconfirmed unspent outputs, and unspendable multisig.">Maximum spend:</abbr></td>
            <td>{this.props.spendableBtc} BTC</td>
          </tr>
          </tbody>
        </table>
      </div>
    );
  }
});