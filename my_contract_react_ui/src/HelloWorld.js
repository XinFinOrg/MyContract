import React, { Component } from 'react';
import './HelloWorld.css';

class HelloWorld extends Component {
  constructor(props) {
    super(props);
    this.state = { greeting: 'Hello' };
    this.frenchify = this.frenchify.bind(this);
  }
  frenchify() {
    this.setState({ greeting: 'Bonjour' });
  }
  render() {
    return (
      <div className="HelloWorld">{this.state.greeting} {this.props.name}!
      <br/>
      <button onClick={this.frenchify}>Frenchify!</button>
      </div>
    );
  }
}

export default HelloWorld;
