var Authorize = React.createClass({displayName: "Authorize",
  render: function() {
    return (
      React.createElement("div", {className: "ui grid"}, 
        React.createElement("div", {className: "column"}, 
          React.createElement("div", {id: "authorize", className: "ui button"}, 
            this.props.children
          )
        )
      )
    );
  }
});
