'use strict';

var React = require('react'),
  Router = require('react-router'),
  RouteHandler = Router.RouteHandler,
  Route = Router.Route,
  PrivKeyBox = require('components/privKey/PrivKeyBox'),
  TransactionBox = require('components/transactions/TransactionBox'),
  AlertArea = require('components/alerts/AlertArea'),
  SpendBox = require('components/spend/SpendBox'),
  blockchainWebsocket = require('utils/blockchainWebsocket');

// Add react globally so we can use the chrome developer tools
window.React = React;

// Let's initialize what we need for the app, starting with the websocket connection
blockchainWebsocket.connect();

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