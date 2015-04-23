var React = require('react');
var transactionActions = require('actions/transactionActions');

var LoadMoreTransactions = React.createClass({
  _loadMoreTransactions: function() {
    transactionActions.fetchTransactions(this.props.address, this.props.nextRange);
  },
  render: function() {
    var style = {
      textAlign: 'center',
      fontSize: 16,
      cursor: 'pointer'
    };

    return (
      <tr className="info">
        <td colSpan="3" style={style} onClick={this._loadMoreTransactions}>Load more transactions</td>
      </tr>
    );
  }
});

module.exports = LoadMoreTransactions;