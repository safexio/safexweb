var config = require('config'),
  privKeyActions = require('actions/privKeyActions'),
  privKeyStore = require('stores/privKeyStore');

// Set the blockchain we're working with
var blockchain = config.network.name === 'testnet' ? 'testnet3' : 'bitcoin';

var WsHandler = function() {
  var conn,
    connInterval,
    addresses = []; // the addresses to monitor

  // Let's us know if we're connected to the websocket
  this.isConnected = function() {
    return (conn && conn.readyState === WebSocket.OPEN) ? true : false;
  };

  // Function that connects to the web socket
  this.connect = function() {
    conn = new WebSocket("wss://ws.chain.com/v2/notifications");

    // what to do after connecting to the websocket
    conn.onopen = function() {
      // If we're connecting after a connection close, clear the interval that keeps trying to reconnect
      if (connInterval) {
        clearInterval(connInterval);
      }

      // If we already have a list of addresses to monitor, monitor them
      addresses.forEach(function(address) {
        monitorAddress(address);
      });
    };

    // When we receive a message from the ws, we need to do something with it.
    conn.onmessage = function(ev) {
      var data = JSON.parse(ev.data).payload;

      switch (data.type) {
        case 'heartbeat':
          // do nothing
          break;
        case 'address':
          // For now, just do a regular request to Chain instead of using the given data
          // Fetch new address balance
          privKeyActions.updateBalances(data.address);

          break;
        default:
          console.log('default case', log);
      }
    };

    // If connection closes, reconnect
    conn.onclose = function(ev) {
      if (!connInterval) {
        connInterval = setInterval(function() {
          console.log('Reconnecting to websocket...');
          try {
            this.connect();
          } catch(e) {
            console.log('caught connection error: ', e);
          }
        }.bind(this), 5000);
      }
    };
    
    // On error
    conn.onerror = function() {
      console.log('Websocket error: ', arguments);
    }
  }

  // The function that sends an address to monitor to chain.com
  function monitorAddress(address) {
    var req = {type: "address", block_chain: blockchain, address: address};
    conn.send(JSON.stringify(req));
  }

  // We call this when we want to add a new address to watch
  this.subscribeAddress = function(address) {
    // Allow providing an array of addresses
    if (Array.isArray(address)) {
      return address.forEach(function(a) {
        this.subscribeAddress(a);
      }.bind(this));
    }

    // If we're already monitoring this address, do nothing
    if (addresses.indexOf(address) > -1) {
      return;
    }

    // Add it to our list of address
    addresses.push(address);

    // If we are connected, monitor it.
    // Otherwise, it'll monitor it when it connects.
    if (this.isConnected()) {
      monitorAddress(address);
    }
  };
}

module.exports = new WsHandler();