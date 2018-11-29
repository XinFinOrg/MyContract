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

    }

    componentDidMount() {
      console.log('Component DID MOUNT!');
      fetch('/api/getClientList')
      .then(res => res.json())
      .then(response => {
        this.setState({
          data: response.clients
        })
      })
    }
    getTrProps(state, rowInfo) {
      if (rowInfo && rowInfo.row) {
        return {
          onClick: (e) => {
            that.setState({
              selected: rowInfo.index
            })
          },
          style: {
            background: rowInfo.index === this.state.selected ? '#00afec' : 'white',
            color: rowInfo.index === this.state.selected ? 'white' : 'black'
          }
        }
      }else{
        return {}
      }
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
      }];
      return (
        <ReactTable
          data={data}
          columns={columns}
          onFetchData={this.fetchData}
          />
      );
    }
}

export default Dashboard;
