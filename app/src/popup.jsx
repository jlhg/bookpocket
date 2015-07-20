var React = require('react');
var URI = require('URIjs');
var mui = require('material-ui');
var config = require('./config.js');
var PocketClient = require('./pocket_client.js');
var client = new PocketClient(config.pocket);
var ThemeManager = new mui.Styles.ThemeManager();

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
      <mui.RaisedButton label={this.props.children}
                        id={this.props.id} />
    );
  }
});

var PocketItem = React.createClass({
  childContextTypes: {
    muiTheme: React.PropTypes.object
  },

  getChildContext: function() {
    return {
      muiTheme: ThemeManager.getCurrentTheme()
    };
  },

  getInitialState: function() {
    var state = {
      isFavorited: false,
      isArchived: false,
      isDeleted: false
    };

    switch (this.props.data.status) {
      case '0':
        state.isArchived = false;
        break;
      case '1':
        state.isArchived = true;
        break;
      case '2':
        state.isDeleted = true;
        break;
    }

    switch (this.props.data.favorite) {
      case '0':
        state.isFavorited = false;
        break;
      case '1':
        state.isFavorited = true;
        break;
    }

    return state;
  },

  getDefaultProps: function() {
    return {
      tagsHeader: "Tags"
    };
  },

  addItem: function(event) {

  },

  deleteItem: function(event) {

  },

  favoriteItem: function(event) {
    var self = this;
    var data = {
      actions: [{
        action: 'favorite',
        item_id: this.props.data.item_id
      }]
    };
    var error = function() {};
    var success = function(details) {
      // TODO
      if (details.status === 1) {
      } else {
      }
      self.setState({
        isFavorited: true
      });
    };
    client.modify(localStorage.accessToken, data, success, error);
  },

  unfavoriteItem: function(event) {
    var self = this;
    var data = {
      actions: [{
        action: 'unfavorite',
        item_id: this.props.data.item_id
      }]
    };
    var error = function() {};
    var success = function(details) {
      // TODO
      if (details.status === 1) {
      } else {
      }
      self.setState({
        isFavorited: false
      });
    };
    client.modify(localStorage.accessToken, data, success, error);
  },

  archiveItem: function(event) {
    var self = this;
    var data = {
      actions: [{
        action: 'archive',
        item_id: this.props.data.item_id
      }]
    };
    var error = function() {};
    var success = function(details) {
      // TODO
      if (details.status === 1) {
      } else {
      }
      self.setState({
        isArchived: true
      });
    };
    client.modify(localStorage.accessToken, data, success, error);
  },

  unarchiveItem: function(event) {
    var self = this;
    var data = {
      actions: [{
        action: 'readd',
        item_id: this.props.data.item_id
      }]
    };
    var error = function() {};
    var success = function(details) {
      // TODO
      if (details.status === 1) {
      } else {
      }
      self.setState({
        isArchived: false
      });
    };
    client.modify(localStorage.accessToken, data, success, error);
  },

  render: function() {
    var itemTags = [];
    var closeIcon = <mui.FontIcon className="material-icons">close</mui.FontIcon>;
    var addItemButton;
    var archiveItemButton;
    var favoriteItemButton;

    if (this.props.data.tags) {
      itemTags = Object.keys(this.props.data.tags);
    }

    if (this.state.isDeleted) {
      addItemButton = <mui.RaisedButton label="add"
                                        onClick={this.addItem}
                                        primary={true} />;
    } else {
      addItemButton = <mui.RaisedButton label="delete"
                                        onClick={this.deleteItem}
                                        primary={true} />;
    }

    if (this.state.isArchived) {
      archiveItemButton = <mui.RaisedButton label="unarchive"
                                            onClick={this.unarchiveItem} />;
    } else {
      archiveItemButton = <mui.RaisedButton label="archive"
                                            onClick={this.archiveItem} />;
    }

    if (this.state.isFavorited) {
      favoriteItemButton = <mui.RaisedButton label="unfavorite"
                                             onClick={this.unfavoriteItem}
                                             secondary={true} />;
    } else {
      favoriteItemButton = <mui.RaisedButton label="favorite"
                                             onClick={this.favoriteItem}
                                             secondary={true} />;
    }

    var tagListItems = [];
    for (var i = 0; i < itemTags.length; ++i) {
      tagListItems.push(<mui.ListItem key={itemTags[i]} primaryText={itemTags[i]} rightIcon={closeIcon} />);
    }

    return (
      <div>
        <div>
          {archiveItemButton}
          {favoriteItemButton}
          {addItemButton}
        </div>
        <mui.List subheader={this.props.tagsHeader}>{tagListItems}</mui.List>
      </div>
    );
  }
});

if (localStorage.accessToken) {
  chrome.tabs.query({
    active: true,
    lastFocusedWindow: true
  }, function(tabs) {
    var currentTab = tabs[0];
    var uri = new URI(currentTab.url);
    var data = {
      domain: uri.host(),
      state: 'all',
      detailType: 'complete',
    };
    var success = function(pocketItem) {
      var item = client.urlMatch(currentTab.url, pocketItem);
      var itemTags = [];
      var pocketItemId = 'pocket_item';
      if (item) {
        if (item.tags) {
          itemTags = Object.keys(item.tags);
        }

        React.render(
          <PocketItem id={pocketItemId} data={item} />,
          document.getElementById('content')
        );
      } else {
        var success = function(details) {};
        var error = function() {};
        client.add(localStorage.accessToken, data, success, error);
      }
    };
    var error = function() {
      React.render(
        React.createElement(PocketError, {message: "Can't add a pocket item."}),
        document.getElementById('content')
      );
    };
    client.retrieve(localStorage.accessToken, data, success, error);
  });
} else {
  var authorizeButtonId = "btn-authorize";

  React.render(
    <AuthorizeButton id={authorizeButtonId}>Authorize</AuthorizeButton>,
    document.getElementById('content')
  );

  document.getElementById(authorizeButtonId).addEventListener('click', function(e) {
    var redirectURI = chrome.extension.getURL('oauth.html');
    client.getRequestToken(redirectURI, function(details) {
      var requestToken = details.code;
      localStorage.setItem('requestToken', requestToken);
      window.open(client.getUserRedirectURL(requestToken, redirectURI), '_blank');
    });
  });
}
