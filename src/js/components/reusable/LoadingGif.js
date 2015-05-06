var React = require('react');

var LoadingGif = React.createClass({
  render: function() {
    return (
      <div className="LoadingGif">Loading<br/><img src="./img/loading.gif" /></div>
    );
  }
});

module.exports = LoadingGif;