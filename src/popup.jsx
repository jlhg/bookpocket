var client = new PocketClient(pocketConfig);

if (!localStorage.accessToken) {
  React.render(
    <Authorize>Authorize</Authorize>,
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
