'use strict';

var React = require('react');
var Router = require('react-router');
var RouteHandler = Router.RouteHandler;
var Route = Router.Route;
var PrivKeyBox = require('components/privKey/PrivKeyBox');
var TransactionBox = require('components/transactions/TransactionBox');
var AlertArea = require('components/alerts/AlertArea');
var SpendBox = require('components/spend/SpendBox');

// Add react globally so we can use the chrome developer tools
window.React = React;

var App = React.createClass({
  render: function() {
    return (
      <div>
        <AlertArea />
        <PrivKeyBox />
        <RouteHandler/>
      </div>
    );
  }
});

var routes = (
  <Route name="app" path="/" handler={App} ignoreScrollBehavior>
    <Route name="transactions" path="transactions/:address" handler={TransactionBox} />
    <Route name="spend" path="spend/:address" handler={SpendBox} />
  </Route>
);

window.addEventListener('load', function() {
  Router.run(routes, function (Handler) {
    React.render(<Handler/>, document.getElementById('app'));
  });
}, false);