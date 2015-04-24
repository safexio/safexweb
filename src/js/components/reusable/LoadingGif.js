var React = require('react');

var LoadingGif = React.createClass({
  render: function() {
    var style = {
      textAlign: 'center',
      fontSize: '22px'
    };

    return (
      <div style={style}>Loading<br/><img src="../img/loading.gif" /></div>
    );
  }
});

module.exports = LoadingGif;