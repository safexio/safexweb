var config = require('config'),
  $ = require('jquery'),
  blockchain;

blockchain = config.network.name === 'testnet' ? 'testnet3' : 'livenet';

// Set default ajax options here
$.ajaxSetup({
  method: 'GET',
  data: {
    'api-key-id': config.chainApiKey
  },
  dataType: 'json',
  contentType: 'application/json',
  timeout: 30000,
  cache: false,
  crossDomain: true
});

var fetch = {

  base: 'https://api.chain.com/v2/' + blockchain + '/',

  addressBalances: function(addresses) {
    addresses = addresses.join();

    var url = this.base + 'addresses/' + addresses;

    return $.ajax({ url });
  },

  broadcast: function(serializedTransaction) {
    var url = this.base + 'transactions/send?api-key-id='+config.chainApiKey;
    
    return $.ajax({
      method: 'POST',
      url: url,
      dataType: 'json',
      data: JSON.stringify({ signed_hex: serializedTransaction }),
      crossDomain: true
    });
  },

  utxos: function(address) {
    var url = this.base + 'addresses/' + address + '/unspents';

    return $.ajax({ url });
  },

  transactions: function(address, nextRange) {
    var url = this.base + 'addresses/' + address + '/transactions';

    return $.ajax({
      url,
      beforeSend: function(xhr) {
        if (nextRange) {
          xhr.setRequestHeader('Range', nextRange);
        }
      },
      data: {
        'api-key-id': config.chainApiKey,
        'limit': 500 // get 500 latest transactions
      }
    });
  }
};

module.exports = fetch;