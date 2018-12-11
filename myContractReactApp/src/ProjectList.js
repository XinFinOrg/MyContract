import React, { Component } from "react";
import { connect } from "react-redux";
import axios from "axios";
import ReactTable from "react-table";
import 'react-table/react-table.css';
import Loader from 'react-loader-spinner';

class ProjectList extends Component {
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
      const {data} = this.state;

      const columns = [{
        Header: 'Coin Name',
        accessor: 'coinName'
      }, {
        Header: 'Network Type',
        accessor: 'networkType',
      }, {
        Header: 'Crowdsale Contract Address',
        accessor: 'crowdsaleContractAddress'
      }, {
        Header: 'Token Contract Address',
        accessor: 'tokenContractAddress'
      }, {
        Header: 'Go to Project List',
        accessor: 'uniqueId'
      }];
      return (
          <ReactTable
            data={data}
            columns={columns}
            onFetchData={this.fetchData}
            noDataText="Not available"
            getTrProps ={(state, rowInfo) => {
              if (rowInfo && rowInfo.row) {
                return {
                  onClick: (e) => {
                    this.setState({
                      selected: rowInfo.index,
                    })
                    this.getProjectList(rowInfo.original.email)
                  },
                  style: {
                    background: rowInfo.index === this.state.selected ? '#00afec' : 'white',
                    color: rowInfo.index === this.state.selected ? 'white' : 'black'
                  }
                }
              }else{
                return {}
              }
            }}
            />
      );
    }
}

export default ProjectList;
