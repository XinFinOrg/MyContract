import React, { Component} from "react";
import "./App.css";
import {hot} from "react-hot-loader";
import { connect } from "react-redux";
import Login from "./Login";



class App extends Component{
  render(){
    return(
      <div className="App">
        <Login />
      </div>
    );
  }
}

export default hot(module)(App);
