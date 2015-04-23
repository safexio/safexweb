import Reflux from 'reflux';

var actions = Reflux.createActions([
  "clearPrivKeyInput",
  "broadcastingTransaction",
  "broadcastCompleted",
  "broadcastFailed",
  "clearBroadcast"
]);

module.exports = actions;