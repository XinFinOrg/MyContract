import React, { Component} from "react";
import "./App.css";
import {hot} from "react-hot-loader";
import { connect } from "react-redux";
import Login from "./Login";
import Dashboard from "./Dashboard";
import { BrowserRouter, Route, Link} from "react-router-dom";



class App extends Component{
  render(){
    return(
      <div className="App">
        <BrowserRouter>
          <div>
            <Route exact path="/projectList" component={Dashboard}/>
            <Route exact path="/superadmin" component={Login}/>
          </div>

        </BrowserRouter>
      </div>
    );
  }
}

export default hot(module)(App);
