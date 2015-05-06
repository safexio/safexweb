var React = require('react');
var Bitcore = require('bitcore');
var Unit = Bitcore.Unit;
var Transaction = Bitcore.Transaction;
var UnspentOutput = Bitcore.Transaction.UnspentOutput;
var Address = Bitcore.Address;
var Calculator = require('utils/transactionCalculator');
var $ = require('jquery');
var _ = require('lodash');

var config = require('config');
var privKeyStore = require('stores/privKeyStore');
var spendStore = require('stores/spendStore');
var spendActions = require('actions/spendActions');
var commonActions = require('actions/commonActions');

var SpendBox = React.createClass({

  contextTypes: {
    router: React.PropTypes.func
  },

  getInitialState: function() {
    return _.assign(spendStore.getStore(), {submitting: false});
  },

  componentWillMount: function() {
    this._switchAddress();
  },

  componentWillReceiveProps: function() {
    this._switchAddress();
  },

  componentDidMount: function() {
    // When there's a new state, it'll simply set the updated privKey object
    this.unsubscribe = spendStore.listen(this._setState);
  },
  
  componentWillUnmount: function() {
    this.unsubscribe();
  },

  _displayWarning: function(error, display) {
    if (display) {
      commonActions.warning(error);
    }
  },

  _calculateFee: function() {
    var error,
      fields = this._getFields();

    // Validations
    if (error = this._getValidationErrors(fields)) {
      this.setState({fee: 0});
      return;
    }

    // Get satoshi value
    var amount = Unit.fromBTC(fields.amount).toSatoshis();

    // Get the utxos we need to send this value
    var utxos = new Calculator.UtxoChooser()
      .utxos(_.clone(this.state.utxos))
      .target(amount)
      .calculate();
    
    // Compile the transaction without signing
    var transaction = this._createTransaction(utxos, fields.sendTo, amount);

    var fee = transaction._estimateFee();

    this.setState({fee});
  },

  _createTransaction: function(utxos, sendTo, amount) {
    var transaction = new Transaction().from(utxos).to(sendTo, amount);

    if (amount < this.state.spendable) {
      transaction.change(this.state.privKey.address);
    }

    return transaction;
  },

  _getValidationErrors: function(fields) {
    var error;

    if (this.state.spendable === 0) {
      // Utxos and spendable amount has not been calculated yet,
      // or amount must be a number.
      return new Error('Waiting for spendable amount.');
    } else if (error = this._addressIsInvalid(fields.sendTo)) {
      return new TypeError('Invalid address provided.');
    } else if (error = this._amountIsInvalid(fields.amount)) {
      return new TypeError(error.message);
    }

    return false;
  },

  _onChangeSendTo: function() {
    this._addressIsInvalid();
  },

  _onChangeAmount: function() {
    this._calculateFee();
  },

  _amountIsInvalid: function(amount) {
    var message = null;
    var group = $(this.refs.amountGroup.getDOMNode());
    
    if (amount === "") {
      message = "You forgot to enter an amount";
      group.removeClass('has-error');
    } else if (isNaN(amount)) {
      message = 'Amount must be numeric.';
      group.addClass('has-error');
    } else if (amount == 0) {
      message = 'Please enter an amount more than 0.';
      group.addClass('has-error');
    } else if (Unit.fromBTC(amount).toSatoshis() > this.state.spendable) {
      message = 'You cannot send more than ' + Unit.fromSatoshis(this.state.spendable).toBTC() + ' BTC';
      group.addClass('has-error');
    }

    if (message) {
      return new TypeError(message);
    } else {
      group.removeClass('has-error');
      return false;
    }
  },

  _addressIsInvalid: function(address) {
    var address = address ? address.trim() : this.refs.sendTo.getDOMNode().value.trim();
    var group = $(this.refs.sendToGroup.getDOMNode());
    
    if (address === '') {
      group.removeClass('has-error');
      return new TypeError('No address provided.');
    }

    var error = Address.getValidationError(address, config.network);

    if (!error) {
      group.removeClass('has-error');
      return false;
    } else {
      group.addClass('has-error');
      return error;
    }
  },

  _setState: function(state) {
    this.setState(state);
  },

  _switchAddress: function() {
    // When a new address is set, find it in the store.
    var address = this.context.router.getCurrentParams().address;

    var privKey = privKeyStore.getByAddress(address);

    if (!privKey) {
      this.context.router.transitionTo('/');
      return;
    }

    // Fetch utxso
    spendActions.fetchUtxos(privKey);

    // For now set the privKey object
    this.setState({privKey});
  },

  _onSubmit: function(e) {
    e.preventDefault();
    var fields = this._getFields(),
      error;

    // Validations
    if (error = this._getValidationErrors(fields)) {
      commonActions.warning(error);
      return;
    }

    // Get satoshi value
    var amount = Unit.fromBTC(fields.amount).toSatoshis();

    // Get the utxos we need to send this value
    var utxos = new Calculator.UtxoChooser()
      .utxos(_.clone(this.state.utxos))
      .target(amount)
      .calculate();

    try {
      // Compile the transaction and sign it.
      var transaction = this._createTransaction(utxos, fields.sendTo, amount);
      var fee = transaction._estimateFee();
      
      var sendingTotal = amount + fee;
      if (!confirm('You are about to send ' + Unit.fromSatoshis(amount).toBTC() + ' BTC to ' + fields.sendTo + ' with a mining fee of ' + Unit.fromSatoshis(fee).toBTC() + '. Are you sure?')) {
        return;
      }

      // Setting state is no synchronous, but that's fine
      this.setState({submitting: true});

      transaction.sign(this.state.privKey.privKey);

      var serializedTransaction = transaction.serialize();

      spendActions.broadcastTransaction(serializedTransaction, this.state.privKey.address);

      this.context.router.transitionTo('/transactions/' + this.state.privKey.address);
    } catch(error) {
      commonActions.error('An error occurred while creating your transaction: ' + error.message);
      this.setState({submitting: false});
      console.log('Error creating your transaction: ', error);
    }
  },

  _getFields: function() {
    return {
      sendTo: this.refs.sendTo.getDOMNode().value.trim(),
      amount: this.refs.amount.getDOMNode().value.trim()
    };
  },

  render: function() {
    var spendableBtc = Unit.fromSatoshis(this.state.spendable).toBTC();

    return (
      <div className="panel panel-default">
        <div className="panel-heading">Spend Bitcoin</div>
        <div className="panel-body">
          <table className="table table-striped table-hover">
            <tbody>
            <tr>
              <td>Send from address</td>
              <td>{this.state.privKey.address}</td>
            </tr>
            <tr>
              <td>Confirmed balance:</td>
              <td>{Unit.fromSatoshis(this.state.privKey.confirmedBalance).toBTC()} BTC</td>
            </tr>
            <tr>
              <td><abbr title="Total amount you can spend from this address, which takes into account the mining fee, unconfirmed unspent outputs, and unspendable multisig.">Maximum spend:</abbr></td>
              <td>{spendableBtc} BTC</td>
            </tr>
            </tbody>
          </table>
          <form className="form-horizontal" onSubmit={this._onSubmit}>
            <div className="form-group" ref="sendToGroup">
              <label className="col-sm-2 control-label">Send to</label>

              <div className="col-sm-10">
                <input name="sendTo" ref="sendTo" onChange={this._onChangeSendTo} type="text" className="form-control" placeholder="18HfQESm32gAeJd2xwqSpyCfvbTQySopd9" required/>
              </div>
            </div>
            <div className="form-group" ref="amountGroup">
              <label className="col-sm-2 control-label">Amount</label>

              <div className="col-sm-3">
                <input onChange={this._onChangeAmount} ref="amount" type="number" className="form-control" placeholder="0.89922" required min="0.0001" step="0.0001" max={spendableBtc} />
              </div>
              <div className="col-sm-3 hidden-xs">
                <button type="submit" className="btn btn-warning" disabled={this.state.submitting ? 'disabled' : ''}>Send</button>
              </div>
            </div>
            <div className="form-group visible-xs">
              <div className="col-sm-offset-2 col-sm-3">
                <button type="submit" className="btn btn-warning" disabled={this.state.submitting ? 'disabled' : ''}>Send</button>
              </div>
            </div>
            <div className="form-group">
              <label className="col-sm-2 control-label">Fee <span className="hidden-lg hidden-md hidden-sm">{Unit.fromSatoshis(this.state.fee).toBTC()} BTC</span></label>

              <p className="hidden-xs col-sm-10 form-control-static">{Unit.fromSatoshis(this.state.fee).toBTC()} BTC</p>
            </div>
          </form>
        </div>
      </div>
    );
  }
});

module.exports = SpendBox;