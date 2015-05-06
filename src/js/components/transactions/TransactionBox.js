var React = require('react');

var transactionStore = require('stores/transactionStore');
var privKeyStore = require('stores/privKeyStore');
var transactionActions = require('actions/transactionActions');
var LoadingGif = require('components/reusable/LoadingGif');
var TransactionSingle = require('components/transactions/TransactionSingle');
var LoadMoreTransactions = require('components/transactions/LoadMoreTransactions');

var TransactionBox = React.createClass({
  contextTypes: {
    router: React.PropTypes.func
  },
  getInitialState: function() {
    return transactionStore.getStore();
  },
  componentWillMount: function() {
    this._fetchTransactions();
  },
  componentWillReceiveProps: function() {
    this._fetchTransactions();
  },
  componentDidMount: function() {
    this.unsubscribe = transactionStore.listen(this._onTransactionListChange);
  },
  componentWillUnmount: function() {
    this.unsubscribe();
  },
  _onTransactionListChange: function(state) {
    this.setState(state);
  },
  _fetchTransactions: function() {
    var address = this.context.router.getCurrentParams().address;

    if (!privKeyStore.storeHasAddress(address)) {
      this.context.router.transitionTo('/');
      return;
    }

    transactionActions.fetchTransactions(address);
  },
  render: function() {
    var body;

    // We display the loading gif ONLY if we're fetching the initial transactions (meaning nextRange
    // is not yet set).
    if (this.state.fetching && !this.state.nextRange) {
      body = <LoadingGif />;
    } else {

      var transactions = this.state.transactions.map(function(transaction) {
        return <TransactionSingle key={transaction.hash} transaction={transaction} address={this.state.address} />
      }.bind(this));

      if (transactions.length < 1) {
        transactions = <tr><td colSpan="5">No transactions</td></tr>;
      }

      body = (
        <table className="table table-striped table-hover">
          <thead>
            <tr>
              <th className="visible-md visible-lg">From</th>
              <th><span className="hidden-md hidden-lg">From /</span> To</th>
              <th>Meta</th>
            </tr>
          </thead>
          <tbody>
            {transactions}
            {this.state.nextRange ? <LoadMoreTransactions nextRange={this.state.nextRange} address={this.state.address} /> : null}
          </tbody>
        </table>
      );
    }

    return (
      <div className="panel panel-default">
        <div className="panel-heading">Transactions for <b>{this.state.address}</b></div>
        <div className="panel-body">
          {body}
          <div style={{textAlign: 'right'}}><i>Time is displayed in your local timezone</i></div>
        </div>
      </div>
    );
  }
});

module.exports = TransactionBox;