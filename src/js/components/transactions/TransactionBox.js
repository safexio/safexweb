var React = require('react'),
  _ = require('lodash'),
  transactionStore = require('stores/transactionStore'),
  privKeyStore = require('stores/privKeyStore'),
  transactionActions = require('actions/transactionActions'),
  LoadingGif = require('components/reusable/LoadingGif'),
  TransactionSingle = require('components/transactions/TransactionSingle'),
  LoadMoreTransactions = require('components/transactions/LoadMoreTransactions');

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
    transactionStore.resetStore;
  },

  _onTransactionListChange: function(state) {
    this.setState(state);
  },

  /**
   * We are here when initially fetching transactions for the first time
   *
   * @private
   */
  _fetchTransactions: function() {
    var address = this.context.router.getCurrentParams().address;

    if (!privKeyStore.storeHasAddress(address)) {
      this.context.router.transitionTo('/');
      return;
    }

    // Fetch initial transactions
    transactionActions.fetchTransactions(address, true);
  },

  render: function() {
    var body;

    // We display the loading gif ONLY if we're fetching the initial transactions (meaning nextRange
    // is not yet set).
    if (this.state.fetchingInitial) {
      body = <LoadingGif />;
    } else {

      var transactions = _.values(this.state.transactions);

      // Sort in descending order
      if (transactions.length > 1) {
        transactions.sort(function(a, b) {
          // desc order of time
          return b.time - a.time;
        });
      }

      // Make an array of table rows
      var displayTransactions = [];

      transactions.forEach(function(transaction, hash) {
        displayTransactions.push(<TransactionSingle key={hash} transaction={transaction} address={this.state.address} />);
      }.bind(this));

      if (displayTransactions.length < 1) {
        displayTransactions = <tr><td colSpan="5">No transactions.</td></tr>;
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
            {displayTransactions}
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
          <div className="text-right"><em>Time is displayed in your local timezone</em></div>
        </div>
      </div>
    );
  }
});

module.exports = TransactionBox;