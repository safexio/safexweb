var React = require('react');
var Unit = require('bitcore').Unit;
var Moment = require('moment')

var TransactionSingle = React.createClass({
  _formatInputs: function(transaction, ourAddress) {

    var inputs = [];

    // An input can have many addresses if sent from multisig.
    // Multisig addresses are grouped with [ ].
    transaction.inputs.forEach(function(input) {
      // First determine if this is a spend
      input.addresses.some(function(address) {
        if (address === ourAddress) {
          transaction.type = 'spend';
          return true;
        }
        return false;
      });

      var length = input.addresses.length;
      if (length === 1) {
        inputs.push(input.addresses[0] + ': ' + Unit.fromSatoshis(input.amount).toBTC());
      } else {
        var count = 1;
        input.addresses.forEach(function(address) {
          if (count === 1) {
            inputs.push('[ ' + address);
          } else {
            if (count === length) {
              address += ' ]' + ': ' + Unit.fromSatoshis(input.amount).toBTC();
            }
            inputs.push(address);
          }

          count++;
        });
      }
    });

    return inputs;
  },
  _formatOutputs: function(transaction, ourAddress) {

    var outputs = [];

    // An input can have many addresses if sent from multisig.
    // Multisig addresses are grouped with [ ].
    transaction.outputs.forEach(function(output) {
      // First determine if this is a receive
      output.addresses.some(function(address) {
        if (address === ourAddress) {
          if (transaction.type) {
            // It's a spend AND receive. Keep it a spend (it's probably change address)
          } else {
            transaction.type = 'receive';
          }
          return true;
        }
        return false;
      });

      var length = output.addresses.length;
      if (length === 1) {
        outputs.push(output.addresses[0] + ': ' + Unit.fromSatoshis(output.amount).toBTC());
      } else {
        var count = 1;
        output.addresses.forEach(function(address) {
          if (count === 1) {
            outputs.push('[ ' + address);
          } else {
            if (count === length) {
              address += ' ]: '  + Unit.fromSatoshis(output.amount).toBTC();
            }
            outputs.push(address);
          }

          count++;
        });
      }
    });

    return outputs;
  },
  render: function() {
    var transaction = this.props.transaction,
      ourAddress = this.props.address;
    
    transaction.time = Moment(transaction.time).format('YYYY-MM-DD HH:mm:ss');

    var inputs = this._formatInputs(transaction, ourAddress);
    var outputs = this._formatOutputs(transaction, ourAddress);

    // Color for the right border, red if spent, green if received
    var color;
    if (transaction.type === 'spend') {
      color = 'FF0039';
    } else if (transaction.type === 'receive') {
      color = '2F8912';
    }

    // Each input, output needs its own key
    var i = 0, o = 0;

    // Further format the inputs/outputs for display
    var inputOutput = inputs.map(function(input) {
      return <span key={'input-'+i++}>{input}<br /></span>
    });
    var outputOutput = outputs.map(function(output) {
      return <span key={'output-'+o++}>{output}<br /></span>
    });

    return (
      <tr style={color ? {borderRight: '5px solid #'+color} : {}}>
        <td className="visible-lg visible-md">
          {inputOutput}
        </td>
        <td>
          <span className="hidden-lg hidden-md"><b>From:</b><br/>{inputOutput}</span>
          <span className="hidden-lg hidden-md"><b>To:</b><br/></span>{outputOutput}
        </td>
        <td>{transaction.time}<br /><b>Total:</b> {Unit.fromSatoshis(transaction.amount).toBTC()} BTC<br /><b><span className="hidden-xs hidden-ms">Confirmations:</span><span className="hidden-lg hidden-md" title="Confirmations">Confs:</span></b> {transaction.confirmations}</td>
      </tr>
    );
  }
});

module.exports = TransactionSingle;