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

var PocketItemContent = React.createClass({
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

    return state;
  },

  getDefaultProps: function() {
    var props = {
      tagsHeader: "Tags"
    };

    return props;
  },

  componentDidMount: function() {
    var self = this;

    // Load cached data first.
    var cachedItem = localStorage[this.props.url];
    if (cachedItem) {
      this.setState(this.parseItemToState(JSON.parse(cachedItem)));
    }

    this.updateStatus(null, function() {
      var data = {
        url: self.props.url
      };
      var errorAddItem = function() {};
      client.add(localStorage.accessToken,
                 data,
                 self.updateStatus,
                 errorAddItem);
    });
  },

  parseItemToState: function(item) {
    var state = {
      itemId: '',
      isFavorited: false,
      isArchived: false,
      isDeleted: false,
      tags: {},
    };
    state.itemId = item.item_id;

    switch (item.status) {
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

    switch (item.favorite) {
      case '0':
        state.isFavorited = false;
        break;
      case '1':
        state.isFavorited = true;
        break;
    }

    if (item.tags) {
      for (var k in item.tags) {
        state.tags[k] = true;
      }
    }

    return state;
  },

  updateStatus: function(success, fail) {
    var self = this;
    var uri = new URI(this.props.url);
    var data = {
      domain: uri.host(),
      state: 'all',
      detailType: 'complete'
    };
    var successGetItem = function(pocketItem) {
      var item = client.urlMatch(self.props.url, pocketItem);
      if (item) {
        self.setState(self.parseItemToState(item));
        common.displaySavedIcon(self.props.tabId);
        common.itemCache.set(item);
        if (success) {
          success();
        }
      } else {
        if (fail) {
          fail();
        }
      }
    };
    var errorGetItem = function() {
      // TODO: 
    };
    client.retrieve(localStorage.accessToken, data, successGetItem, errorGetItem);
  },

  addItem: function(event) {
    // TODO:
  },

  deleteItem: function(event) {
    var self = this;
    var data = {
      actions: [{
        action: 'delete',
        item_id: this.state.itemId
      }]
    };
    var error = function() {
      // TODO: 
    };
    var success = function(details) {
      if (details.status === 1) {
        // TODO:
      } else {

      }

      delete localStorage[self.props.url];
      common.displayUnsavedIcon(self.props.tabId, function() {
        window.close();
      });
    };
    client.modify(localStorage.accessToken, data, success, error);
  },

  favoriteItem: function(event) {
    var self = this;
    var data = {
      actions: [{
        action: 'favorite',
        item_id: this.state.itemId
      }]
    };
    var error = function() {
      // TODO: 
    };
    var success = function(details) {
      if (details.status === 1) {
        // TODO: 
      } else {

      }

      self.setState({
        isFavorited: true
      });

      self.updateStatus();
    };
    client.modify(localStorage.accessToken, data, success, error);
  },

  unfavoriteItem: function(event) {
    var self = this;
    var data = {
      actions: [{
        action: 'unfavorite',
        item_id: this.state.itemId
      }]
    };
    var error = function() {
      // TODO: 
    };
    var success = function(details) {
      if (details.status === 1) {
        // TODO:
      } else {

      }

      self.setState({
        isFavorited: false
      });

      self.updateStatus();
    };
    client.modify(localStorage.accessToken, data, success, error);
  },

  archiveItem: function(event) {
    var self = this;
    var data = {
      actions: [{
        action: 'archive',
        item_id: this.state.itemId
      }]
    };
    var error = function() {
      // TODO: 
    };
    var success = function(details) {
      if (details.status === 1) {
        // TODO: 
      } else {

      }

      self.setState({
        isArchived: true
      });

      self.updateStatus();
    };
    client.modify(localStorage.accessToken, data, success, error);
  },

  unarchiveItem: function(event) {
    var self = this;
    var data = {
      actions: [{
        action: 'readd',
        item_id: this.state.itemId
      }]
    };
    var error = function() {
      // TODO: 
    };
    var success = function(details) {
      if (details.status === 1) {
        // TODO: 
      } else {

      }

      self.setState({
        isArchived: false
      });

      self.updateStatus();
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
        item_id: this.state.itemId
      }]
    };

    var error = function() {
      // TODO:
    };

    var success = function(details) {
      self.setState({userInputTags: ''}, function() {
        textAddTags.focus();
      });

      if (details.status === 1) {
        // TODO              
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

      self.updateStatus();
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
        item_id: this.state.itemId
      }]
    };

    var error = function() {
      // TODO:
    };

    var success = function(details) {
      if (details.status === 1) {
        // TODO        
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

      self.updateStatus();
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

var renderPopupContent = function() {
  if (localStorage.accessToken) {
    chrome.tabs.query({
      active: true,
      lastFocusedWindow: true
    }, function(tabs) {
      var currentTab = tabs[0];
      React.render(
        <PocketItemContent tabId={currentTab.id} url={currentTab.url} />,
        document.getElementById('content')
      );
    });
  } else {
    React.render(
      <AuthorizeContent />,
      document.getElementById('content')
    );
  }
};

document.addEventListener("DOMContentLoaded", renderPopupContent);
