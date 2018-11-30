import React, { Component } from "react";
import { connect } from "react-redux";
import axios from "axios";


class Login extends Component {
    constructor(props){
      super(props);
      this.state = {
        email: '',
        password: '',
      };

      this.handleChange = this.handleChange.bind(this);
      this.onSubmitForm = this.onSubmitForm.bind(this);
    }

    handleChange(e) {
      const { name, value } = e.target;
      console.log("name", name, "value", value);
      this.setState({ [name]: value });
    }
    onSubmitForm(e) {
      e.preventDefault();
      console.log("Submitted");
      axios.post("/api/login", {email: this.state.email, password: this.state.password}).then(res=> {
        console.log(res);
      });
    }
    render() {
        const { email, password } = this.state;
        return (
          <div className="col-md-6 col-md-offset-3">
            <h2>Login</h2>
            <form name="form">
                    <label htmlFor="username">Username</label>
                    <input type="text" name="email" value= {email} onChange={this.handleChange} />
                    <label htmlFor="password">Password</label>
                    <input type="password" name="password" onChange={this.handleChange}/>
                    <button className="btn btn-primary" onClick= {this.onSubmitForm}>Login</button>
            </form>
        </div>

        );
    }
}

export default Login;
