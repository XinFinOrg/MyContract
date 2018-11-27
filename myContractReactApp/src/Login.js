import React, { Component } from "react";
import { connect } from "react-redux";


class Login extends Component {
    render() {
        return (
            <div className="main-wrapper">
            {/* Preloader */}
            <link href="assets/css/style.min.css" rel="stylesheet" />
            <link href="assets/css/custom.css" rel="stylesheet" />
            <link href="https://fonts.googleapis.com/css?family=Muli:200,300,400,600,700,800,900" rel="stylesheet" />
            {/* <div className="preloader">
              <div className="lds-ripple">
                <div className="lds-pos" />
                <div className="lds-pos" />
              </div>
            </div> */}
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
                              <form className="form-horizontal m-t-20" id="loginform" action="#">
                                <div className="form-group">
                                  <label htmlFor="email">Email</label>
                                  <input type="email" className="form-control" id="email" placeholder="Enter email" />
                                </div>
                                <div className="form-group">
                                  <label htmlFor="password">Password</label>
                                  <input type="password" className="form-control" id="password" placeholder="Enter password" />
                                </div>
                                <div className="form-group">
                                  <div className="row align-items-center">
                                    <div className="col-md-12 p-b-20">
                                      <button className="btn btn-lg btn-rounded btn-info" type="submit">LOGIN</button>                                        <span className="pl-5"><a href="javascript:void(0)" id="to-recover" className="text-dark"><i className="fa fa-lock m-r-5" /> Forgot password?</a></span>
                                    </div>
                                  </div>
                                </div>
                                <p className="line-on-side text-muted text-center font-small-3 mx-2"><span>OR continue with</span></p>
                                <div className="row full-width">
                                  <div className="col-xs-12 col-sm-12 col-md-12 m-t-10 text-center">
                                    <div className="social">
                                      <a href="javascript:void(0)" className="btn btn-lg btn-rounded btn-googleplus m-b-15" data-toggle="tooltip" title data-original-title="Login with Google"> <i aria-hidden="true" className="fab fa-google-plus-square" /> GooglePlus</a>
                                      <a href="javascript:void(0)" className="btn btn-lg btn-rounded btn-github m-b-15" data-toggle="tooltip" title data-original-title="Login with GitHub"> <i aria-hidden="true" className="fab fa-github" /> GitHub</a>
                                    </div>
                                  </div>
                                </div>
                                <div className="form-group m-b-0 m-t-15">
                                  <div className="col-sm-12">
                                    Don't have an account? <a href="register.html" className="text-info m-l-5"><b>Sign Up</b></a>
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
                            <h5 className="font-normal m-b-20">Enter your Email and instructions will be sent to you!</h5>
                          </div>
                          <div className="row m-t-20">
                            {/* Form */}
                            <form className="col-12" action="#">
                              {/* email */}
                              <div className="form-group">
                                <label htmlFor="email">Email</label>
                                <input type="email" className="form-control" id="email" placeholder="Email" />
                              </div>
                              <div className="form-group">
                                <div className="row align-items-center">
                                  <div className="col-md-12 p-b-20">
                                    <button className="btn btn-lg btn-rounded btn-info" type="submit">Reset</button>
                                  </div>
                                </div>
                              </div>
                            </form>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-sm-12 col-md-6 col-lg-7">
                    <div className="auth-wrapper-bg">
                      <div className="auth-box_content">
                        <p className="font-bold">Lorem ipsum dollar amet, consectetur adpiscing Ut enim ad minim.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        );
    }
}

export default Login;
