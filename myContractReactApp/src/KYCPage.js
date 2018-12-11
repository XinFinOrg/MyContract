import React, { Component } from "react";
import { connect } from "react-redux";
import axios from "axios";
import ReactTable from "react-table";
import 'react-table/react-table.css';
import Loader from 'react-loader-spinner';

class KYCPage extends Component {
    constructor(props){
      super(props);
      this.state = {
        data: [],
        selected: null
      };
      this.componentDidMount = this.componentDidMount.bind(this);
      this.getProjectList = this.getProjectList.bind(this);
    }

    componentDidMount() {
      axios.post('/api/projectList', {'email': this.props.match.params.userEmail})
      .then(res => {
        this.setState({
          data: res.data.projects
        })
      })
    }

    getProjectList(email) {
      axios.post('/api/projectList', {'email': email})
      .then(res => {
        console.log(res.data.projects);
      })
    }
    render() {
      return (
          <div>
            Hello World
          </div>
      );
    }
}

export default KYCPage;
