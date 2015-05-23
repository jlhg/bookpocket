var Authorize = React.createClass({
  render: function() {
    return (
      <div className="ui grid">
        <div className="column">
          <div id="authorize" className="ui button">
            {this.props.children}
          </div>
        </div>
      </div>
    );
  }
});
