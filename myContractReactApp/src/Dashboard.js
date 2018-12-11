import React, { Component } from "react";
import { connect } from "react-redux";
import axios from "axios";
import ReactTable from "react-table";
import 'react-table/react-table.css'

class Dashboard extends Component {
    constructor(props){
      super(props);
      this.state = {
        data: [],
        selected: null
      };
      this.componentDidMount = this.componentDidMount.bind(this);
      this.getProjectList = this.getProjectList.bind(this);
      this.getKYCList = this.getKYCList.bind(this);
    }

    componentDidMount() {
      fetch('/api/getClientList')
      .then(res => res.json())
      .then(response => {
        this.setState({
          data: response.clients
        })
      })
    }

    getProjectList(email) {
      this.props.history.push('/projectList/'+email)
    }

    getKYCList(uniqueId) {
      this.props.history.push('/kycList/'+uniqueId)
    }
    render() {
      const {data} = this.state;

      const columns = [{
        Header: 'Name',
        accessor: 'name'
      }, {
        Header: 'Email',
        accessor: 'email',
      }, {
        Header: 'KYC status',
        accessor: 'kyc_verified'
      }, {
        Header: 'Attempts taken',
        accessor: 'attemptsCount'
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
          getTdProps ={(state, rowInfo, column) => {
            if (rowInfo && rowInfo.row) {
              return {
                onClick: (e) => {
                  this.setState({
                    selected: rowInfo.index,
                  })
                  if(column.id == "uniqueId")
                    this.getProjectList(rowInfo.original.email)
                  else if(column.id == "kyc_verified")
                    this.getKYCList(rowInfo.original.uniqueId)
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

export default Dashboard;
