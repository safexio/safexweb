var React = require('react');
var Unit = require('bitcore').Unit;
var Moment = require('moment')

var TransactionSingle = React.createClass({
  render: function() {
    var transaction = this.props.transaction,
      ourAddress = this.props.address;
    
    transaction.time = Moment(transaction.time).format('YYYY-MM-DD HH:mm:ss');

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
        inputs.push(input.addresses[0]/* + ' - ' + input.amount*/);
      } else {
        var count = 1;
        input.addresses.forEach(function(address) {
          if (count === 1) {
            inputs.push('[ ' + address);
          } else {
            if (count === length) {
              address += ' ]';
            }
            inputs.push(address);
          }

          count++;
        });
      }
    });
    
    var outputs = [];
    // An input can have many addresses if sent from multisig.
    // Multisig addresses are grouped with [ ].
    transaction.outputs.forEach(function(output) {
      // First determine if this is a receive
      output.addresses.some(function(address) {
        if (address === ourAddress) {
          if (transaction.type) {
            // It's a spend AND receive. Just don't display a color.
          } else {
            transaction.type = 'receive';
          }
          return true;
        }
        return false;
      });

      var length = output.addresses.length;
      if (length === 1) {
        outputs.push(output.addresses[0] + ' - ' + Unit.fromSatoshis(output.amount).toBTC());
      } else {
        var count = 1;
        output.addresses.forEach(function(address) {
          if (count === 1) {
            outputs.push('[ ' + address);
          } else {
            if (count === length) {
              address += ' ] - '  + Unit.fromSatoshis(output.amount).toBTC();
            }
            outputs.push(address);
          }

          count++;
        });
      }
    });

    var color;
    if (transaction.type === 'spend') {
      color = 'FF0039';
    } else if (transaction.type === 'receive') {
      color = '2F8912';
    }

    return (
      <tr style={color ? {borderRight: '5px solid #'+color} : {}}>
        <td>
          {inputs.map(function(input) {
            return <span key={input}>{input}<br /></span>
          })}
        </td>
        <td>
          {outputs.map(function(output) {
            return <span key={output}>{output}<br /></span>
          })}
        </td>
        <td>{transaction.time}<br /><b>Total:</b> {Unit.fromSatoshis(transaction.amount).toBTC()} BTC<br /><b>Confirmations:</b> {transaction.confirmations}</td>
      </tr>
    );
  }
});

module.exports = TransactionSingle;