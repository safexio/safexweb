var React = require('react');
var transactionActions = require('actions/transactionActions');

var LoadMoreTransactions = React.createClass({
  _loadMoreTransactions: function() {
    transactionActions.fetchTransactions(this.props.address, this.props.nextRange);
  },
  render: function() {
    return (
      <tr className="info LoadMoreTransactions">
        <td className="loadMoreArea" colSpan="3" onClick={this._loadMoreTransactions}>Load more transactions</td>
      </tr>
    );
  }
});

module.exports = LoadMoreTransactions;