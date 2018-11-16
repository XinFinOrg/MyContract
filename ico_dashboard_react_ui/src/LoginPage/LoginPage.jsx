import React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';

import { userActions } from '../_actions';


class LoginPage extends React.Component {
    constructor(props) {
        super(props);

        // reset login status
        this.props.dispatch(userActions.logout());

        this.state = {
            username: '',
            password: '',
            submitted: false
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleChange(e) {
        const { name, value } = e.target;
        this.setState({ [name]: value });
    }

    handleSubmit(e) {
        e.preventDefault();

        this.setState({ submitted: true });
        const { username, password } = this.state;
        const { dispatch } = this.props;
        if (username && password) {
            dispatch(userActions.login(username, password));
        }
    }

    render() {
        const { loggingIn } = this.props;
        const { username, password, submitted } = this.state;
        return (
          <div>
{/* HTML5 Shim and Respond.js IE8 support of HTML5 elements and media queries */}
{/* WARNING: Respond.js doesn't work if you view the page via file:// */}
{/*[if lt IE 9]>


<![endif]*/}
<div className="main-wrapper">
  {/* Preloader */}
  <div className="preloader">
    <div className="lds-ripple">
      <div className="lds-pos" />
      <div className="lds-pos" />
    </div>
  </div>
  {/* Preloader */}
  {/* Login box */}
  <section>
    <div className="container-fluid">
      <div className="row">
        <div className="col-sm-12 col-md-6 col-lg-5">
          <div className="auth-wrapper d-flex no-block justify-content-center align-items-center">
            <div className="auth-box login-box">
              <div id="loginform">
                <div className="logo">
                  <span className="db"><img src="assets/images/logo.png" alt="AltCoin" /></span>
                  <h2 className="font-medium m-t-20 m-b-20">Welcome to MyContract</h2>
                  <h5 className="font-normal m-b-20">Enter your details to Sign In</h5>
                </div>
                {/* Form */}
                <div className="row">
                  <div className="col-12">
                    <form className="form-horizontal m-t-20" id="loginform" action="/api/login" method="post">
                      <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input type="emailid" className="form-control" id="emailid" name="email" placeholder="Enter email" />
                      </div>
                      <span className="alert-danger" id="inputVal_error" />
                      <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input type="password" className="form-control" id="password" name="password" placeholder="Enter password" />
                      </div>
                      <span className="alert-danger" id="inputVal_error1" />
                      <div className="form-group">
                        <div className="row align-items-center">
                          <div className="col-md-12 p-b-20">
                            <button className="btn btn-lg btn-rounded btn-info" id="loginButton" type="submit">LOGIN</button>
                            <span className="pl-5"><a href="javascript:void(0)" id="to-recover" className="text-dark"><i className="fa fa-lock m-r-5" />
                                Forgot password?</a></span>
                          </div>
                        </div>
                      </div>
                      <p className="line-on-side text-muted text-center font-small-3 mx-2"><span>OR
                          continue with</span></p>
                      <div className="row full-width">
                        <div className="col-xs-12 col-sm-12 col-md-12 m-t-10 text-center">
                          <div className="social">
                            <a href="/auth/google" className="btn btn-lg btn-rounded btn-googleplus m-b-15" data-toggle="tooltip" title data-original-title="Login with Google">
                              <i aria-hidden="true" className="fab fa-google" />
                              Google</a>
                            <a href="/auth/github" className="btn btn-lg btn-rounded btn-github m-b-15" data-toggle="tooltip" title data-original-title="Login with GitHub">
                              <i aria-hidden="true" className="fab fa-github" />
                              GitHub</a>
                          </div>
                        </div>
                      </div>
                      <div className="form-group m-b-0 m-t-15">
                        <div className="col-sm-12">
                          Don't have an account? <a href="/signup" className="text-info m-l-5"><b>Sign
                              Up
                            </b></a>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
              <div id="recoverform">
                <div className="logo">
                  <span className="db"><img src="assets/images/logo.png" alt="AltCoin" /></span>
                  <h2 className="font-medium m-t-20 m-b-20">Recover Password</h2>
                  <h5 className="font-normal m-b-20">Enter your Email and instructions will be sent to
                    you!
                  </h5>
                </div>
                <div className="row m-t-20">
                  {/* <form class="col-12" action="/forgotPassword" method="GET"> */}
                  <form className="col-12">
                    <label htmlFor="email">Email</label> <input className="form-control" type="text" name="email" id="emailid" placeholder="email" />
                    <br /> <span className="alert-danger" id="inputVal_error" />
                    <br /><br />
                    <button className="btn btn-lg btn-rounded btn-info" type="button" onsubmit="forgotPassword()" value="Submit" id="to-recoveremailsent">Submit</button>
                  </form>
                </div>
              </div>
              <div id="recoverformSend">
                <div className="logo">
                  <span className="db"><img src="assets/images/logo.png" alt="AltCoin" /></span>
                  <h2 className="font-medium m-t-20 m-b-20"> Password Recovery email sent!</h2>
                  <h5 className="font-normal m-b-20">check your email for further instructions!</h5>
                </div>
              </div>
              <div id="noUserFound">
                <div className="logo">
                  <span className="db"><img src="assets/images/logo.png" alt="AltCoin" /></span>
                  <h2 className="font-medium m-t-20 m-b-20"> No user found with this email address!</h2>
                </div>
              </div>
              <div id="noPassword">
                <div className="logo">
                  <span className="db"><img src="assets/images/logo.png" alt="AltCoin" /></span>
                  <h2 className="font-medium m-t-20 m-b-20"> Opps! it seems you have already logged in
                    using github or google!</h2>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-sm-12 col-md-6 col-lg-7">
          <div className="auth-wrapper-bg">
            <div className="auth-box_content">
              <p className="font-bold">Create your smart contract without coding</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</div>
{/* All Required js */}
{/* Bootstrap tether Core JavaScript */}
{/* This page plugin js */}
</div>
        );
    }
}

function mapStateToProps(state) {
    const { loggingIn } = state.authentication;
    return {
        loggingIn
    };
}

const connectedLoginPage = connect(mapStateToProps)(LoginPage);
export { connectedLoginPage as LoginPage };
