import React, { Component} from "react";
import "./App.css";
import {hot} from "react-hot-loader";
import { connect } from "react-redux";
import Login from "./Login";
import Dashboard from "./Dashboard";
import ProjectList from "./ProjectList";
import KYCPage from "./KYCPage";
import { BrowserRouter, Route, Link} from "react-router-dom";



class App extends Component{
  render(){
    return(
      <div className="App">
        <BrowserRouter>
          <div>
            <Route exact path="/projectList" component={Dashboard}/>
            <Route path="/projectList/:userEmail" component={ProjectList}/>
            <Route exact path="/kycList/:uniqueId" component={KYCPage}/>
            <Route exact path="/superadmin" component={Login}/>
          </div>

        </BrowserRouter>
      </div>
    );
  }
}

export default hot(module)(App);
