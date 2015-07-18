var React = require('react');
var mui = require('material-ui');
var config = require('./config.js');
var PocketClient = require('./pocket_client.js');
var client = new PocketClient(config.pocket);
var ThemeManager = new mui.Styles.ThemeManager();
var RaisedButton = mui.RaisedButton;

var AuthorizeButton = React.createClass({
  childContextTypes: {
    muiTheme: React.PropTypes.object
  },
  getChildContext: function() {
    return {
      muiTheme: ThemeManager.getCurrentTheme()
    };
  },
  render: function() {
    return (
      <RaisedButton label={this.props.children} id="authorize" />
    );
  }
});

if (!localStorage.accessToken) {
  React.render(
    <AuthorizeButton>Authorize</AuthorizeButton>,
    document.getElementById('content')
  );

  document.getElementById('authorize').addEventListener('click', function(e) {
    var redirectURI = chrome.extension.getURL('oauth.html');
    client.getRequestToken(redirectURI, function(details) {
      var requestToken = details.code;
      localStorage.setItem('requestToken', requestToken);
      window.open(client.getUserRedirectURL(requestToken, redirectURI), '_blank');
    });
  });
}
