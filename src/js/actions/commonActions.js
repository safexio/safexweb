import Reflux from 'reflux';

var Actions = Reflux.createActions([
  "error",
  "warning",
]);

Actions.error.preEmit = function(error) {
  alert(error);
};

Actions.warning.preEmit = function(warning) {
  alert(warning);
};

module.exports = Actions;