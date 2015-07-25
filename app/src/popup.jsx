var React = require('react');
var URI = require('URIjs');
var mui = require('material-ui');
var config = require('./config.js');
var PocketClient = require('./pocket_client.js');
var common = require('./common.js');
var client = new PocketClient(config.pocket);
var ThemeManager = new mui.Styles.ThemeManager();

var AuthorizeContent = React.createClass({
  childContextTypes: {
    muiTheme: React.PropTypes.object
  },

  getChildContext: function() {
    return {
      muiTheme: ThemeManager.getCurrentTheme()
    };
  },

  startAuthFlow: function(event) {
    var redirectURI = chrome.extension.getURL('oauth.html');
    client.getRequestToken(redirectURI, function(details) {
      var requestToken = details.code;
      localStorage.setItem('requestToken', requestToken);
      window.open(client.getUserRedirectURL(requestToken, redirectURI), '_blank');
    });
  },

  render: function() {
    return (
      <mui.RaisedButton label="Authorize" onClick={this.startAuthFlow} />
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
      userInputTags: '',
      isFavorited: false,
      isArchived: false,
      isDeleted: false,
      tags: {},
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

    if (this.props.data.tags) {
      for (var k in this.props.data.tags) {
        state.tags[k] = true;
      }
    }

    return state;
  },

  getDefaultProps: function() {
    return {
      tagsHeader: "Tags"
    };
  },

  addItem: function(event) {
    // TODO:
  },

  deleteItem: function(event) {
    var self = this;
    var data = {
      actions: [{
        action: 'delete',
        item_id: this.props.data.item_id
      }]
    };
    var error = function() {};
    var success = function(details) {
      // TODO:
      if (details.status === 1) {
      } else {
      }

      chrome.tabs.query({
        active: true,
        lastFocusedWindow: true
      }, function(tabs) {
        var currentTab = tabs[0];
        var afterDeleted = function() {
          window.close();
        };
        common.displayUnsavedIcon(currentTab.id, afterDeleted);
      });
    };
    client.modify(localStorage.accessToken, data, success, error);
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
      // TODO:
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
      // TODO:
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

  setUserInputTags: function(event) {
    this.setState({userInputTags: event.target.value});
  },

  addTag: function(event) {
    var self = this;
    var textAddTags = React.findDOMNode(this.refs.textAddTags);
    var tag = this.state.userInputTags.trim().toLowerCase();
    var data = {
      actions: [{
        action: 'tags_add',
        tags: tag,
        item_id: this.props.data.item_id
      }]
    };

    var error = function() {
      // TODO:
    };

    var success = function(details) {
      self.setState({userInputTags: ''}, function() {
        textAddTags.focus();
      });
      // TODO      
      if (details.status === 1) {
      } else {
      }
      var tags = tag.split(',');
      var newTags = {};
      var updateTags;

      for (var i = 0; i < tags.length; ++i) {
        tags[i] = tags[i].trim();
        if (tags[i]) {
          newTags[tags[i]] = true;
        }
      }
      updateTags = React.addons.update(self.state.tags, {
        $merge: newTags
      });
      self.setState({
        tags: updateTags
      });
    };

    client.modify(localStorage.accessToken, data, success, error);
  },

  deleteTag: function(event) {
    var self = this;
    var tag = event.target.getAttribute("data-tag");
    var data = {
      actions: [{
        action: 'tags_remove',
        tags: tag,
        item_id: this.props.data.item_id
      }]
    };

    var error = function() {
      // TODO:
    };

    var success = function(details) {
      // TODO
      if (details.status === 1) {
      } else {
      }
      var newTags = {};
      var updateTags;

      newTags[tag] = false;
      updateTags = React.addons.update(self.state.tags, {
        $merge: newTags
      });
      self.setState({
        tags: updateTags
      });
    };

    client.modify(localStorage.accessToken, data, success, error);
  },

  render: function() {
    var self = this;
    var addItemButton;
    var archiveItemButton;
    var favoriteItemButton;
    var btnLabelStyle = {
      fontSize: 10
    };
    var btnStyle = {
      marginLegt: "12px",
      marginRight: "12px"
    };

    if (this.state.isDeleted) {
      addItemButton = <mui.RaisedButton label="add"
                                        labelStyle={btnLabelStyle}
                                        style={btnStyle}
                                        primary={true}
                                        onClick={this.addItem} />;
    } else {
      addItemButton = <mui.RaisedButton label="delete"
                                        labelStyle={btnLabelStyle}
                                        style={btnStyle}
                                        primary={true}
                                        onClick={this.deleteItem} />;
    }

    if (this.state.isArchived) {
      archiveItemButton = <mui.RaisedButton label="unarchive"
                                            labelStyle={btnLabelStyle}
                                            style={btnStyle}
                                            secondary={true}
                                            onClick={this.unarchiveItem} />;
    } else {
      archiveItemButton = <mui.RaisedButton label="archive"
                                            labelStyle={btnLabelStyle}
                                            style={btnStyle}
                                            secondary={true}
                                            onClick={this.archiveItem} />;
    }

    if (this.state.isFavorited) {
      favoriteItemButton = <mui.RaisedButton label="unfavorite"
                                             labelStyle={btnLabelStyle}
                                             style={btnStyle}
                                             secondary={true}
                                             onClick={this.unfavoriteItem} />;
    } else {
      favoriteItemButton = <mui.RaisedButton label="favorite"
                                             labelStyle={btnLabelStyle}
                                             style={btnStyle}
                                             secondary={true}
                                             onClick={this.favoriteItem} />;
    }

    return (
      <div style={{width: "340px", marginLeft: "10px", marginRight: "10px"}}>
        <mui.List subheader={this.props.tagsHeader}
                  subheaderStyle={{fontSize: "16px"}}>
          {Object.keys(this.state.tags).map(function(tag) {
            if (self.state.tags[tag]) {
              var closeIcon = <mui.FontIcon className="material-icons"
                                            data-tag={tag}
                                            onClick={self.deleteTag}>close</mui.FontIcon>;
              return <mui.ListItem key={tag}
                                   primaryText={tag}
                                   rightIcon={closeIcon}
                                   style={{fontSize: "14px"}}/>;
            }
           })}
        </mui.List>
        <mui.TextField hintText="Add tags"
                       ref="textAddTags"
                       value={this.state.userInputTags}
                       fullWidth={true}
                       onChange={this.setUserInputTags}
                       onEnterKeyDown={this.addTag} />
        <div style={{marginTop: "10px"}}>
          {archiveItemButton}
          {favoriteItemButton}
          {addItemButton}
        </div>
      </div>
    );
  }
});

var renderPocketItem = function(item) {
  var itemTags = [];
  if (item.tags) {
    itemTags = Object.keys(item.tags);
  }

  React.render(
    <PocketItem id={item.id} data={item} />,
    document.getElementById('content')
  );
};

var getPocketItem = function(url, success, error) {
  var uri = new URI(url);
  var data = {
    domain: uri.host(),
    state: 'all',
    detailType: 'complete'
  };
  client.retrieve(localStorage.accessToken, data, success, error);
};

if (localStorage.accessToken) {
  chrome.tabs.query({
    active: true,
    lastFocusedWindow: true
  }, function(tabs) {
    var currentTab = tabs[0];
    var success = function(pocketItem) {
      var item = client.urlMatch(currentTab.url, pocketItem);
      if (item) {
        renderPocketItem(item);
        common.displaySavedIcon(currentTab.id);
      } else {
        var data = {
          url: currentTab.url
        };
        var successAddPocketItem = function(details) {
          var successGetPocketItem = function(pocketItem) {
            var item = client.urlMatch(currentTab.url, pocketItem);
            if (item) {
              renderPocketItem(item);
              common.displaySavedIcon(currentTab.id);
            } else {
              // TODO: item was added but not retrieved later.
            }
          };
          var errorGetPocketItem = function() {
            // TODO:
          };
          getPocketItem(currentTab.url, successGetPocketItem, errorGetPocketItem);
        };
        var errorAddPocketItem = function() {
          // TODO:
        };
        client.add(localStorage.accessToken, data, successAddPocketItem, errorAddPocketItem);
      }
    };
    var error = function() {
      // TODO:
    };
    getPocketItem(currentTab.url, success, error);
  });
} else {
  React.render(
    <AuthorizeContent />,
    document.getElementById('content')
  );
}
