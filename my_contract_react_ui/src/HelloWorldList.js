import React, { Component } from 'react';
import './HelloWorldList.css';
import HelloWorld from './HelloWorld';
import AddGreeter from './AddGreeter';

class HelloWorldList extends Component {
  constructor(props) {
  super(props);
  this.state = { greetings: ['Jim', 'Sally', 'Bender'] };
  this.addGreeting = this.addGreeting.bind(this);
}
renderGreetings() {
  return this.state.greetings.map(name => (
    <HelloWorld key={name} name={name}/>
  ));
}
addGreeting(newName) {
  this.setState({ greetings: [...this.state.greetings, newName] });
}
render() {
return (
  <div className="HelloWorldList">
  <AddGreeter addGreeting={this.addGreeting} />
    {this.renderGreetings()}
  </div>
);
}
}
export default HelloWorldList;
