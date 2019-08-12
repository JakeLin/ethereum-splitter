import React, { Component } from 'react';

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import Card from '@material-ui/core/Card';

import Web3 from 'web3';

import './App.css';

const { abi, networks } = require('./contracts/Splitter.json');

// Support ropsten testnet
const contractAddress = networks['3'].address;

class App extends Component {
  state = {
    owner: '',
    balances: [],
    hasError: false,
    message: '',
    contractLoaded: false
  };

  async componentDidMount() {
    try {
      // Checking if Web3 has been injected by the browser (Mist/MetaMask)
      if (typeof window.web3 !== 'undefined') {
        // Use Mist/MetaMask's provider.
        const web3 = new Web3(window.web3.currentProvider);
        console.log('Web3 Detected! ' + web3.currentProvider.constructor.name);

        const accounts = await web3.eth.getAccounts();
        if (accounts.length === 0) {
          this.setState({ hasError: true, message: 'Please sign in MetaMask and refresh the page!' });
          return;
        }

        const contract = new web3.eth.Contract(abi, contractAddress)
        const network = await web3.eth.net.getNetworkType();
        const owner = await contract.methods.owner().call();
        const contractBalance = web3.utils.fromWei(await web3.eth.getBalance(contractAddress));
        this.setState({ web3, contract, owner, contractBalance, accounts, network, contractLoaded: true });
      } else {
        console.log('No Web3 Detected!');
        this.setState({ hasError: true, message: 'Please install MetaMask to use this app!' });
      }
    } catch(e) {
      console.error(e);
      this.setState({ hasError: true, message: 'Something went wrong!' });
    }
  }

  renderContractInfo = () => {
    const {contractLoaded, network, contractBalance} = this.state;
    if (contractLoaded) {
      const url = `//ropsten.etherscan.io/address/${contractAddress}`
      return (
        <Card className="card">
          <Table className="contact-info-table">
            <TableBody>
              <TableRow key="network">
                <TableCell align="right">Network</TableCell>
                <TableCell align="left">{network}</TableCell>
              </TableRow>
              <TableRow key="network">
                <TableCell align="right">Contract address</TableCell>
                <TableCell align="left"><a href={url} target="_blank">{contractAddress}</a></TableCell>
              </TableRow>
              <TableRow key="network">
                <TableCell align="right">Contract balance</TableCell>
                <TableCell align="left">{contractBalance} ether</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Card>
      );
    }

    return (
      <span className="loading-message"> Loading contract info... </span>
    );
  };

  renderCheckAccountBalances = () => {
    const {contractLoaded} = this.state;
    if (!contractLoaded) {
      return null;
    }
  };

  renderSplit = () => {
    const {contractLoaded} = this.state;
    if (!contractLoaded) {
      return null;
    }
  };

  renderWithdraw = () => {
    const {contractLoaded} = this.state;
    if (!contractLoaded) {
      return null;
    }
  };

  render() {
    return (
      <div className="cards">
          { this.renderContractInfo() }
        <div>
          { this.renderCheckAccountBalances() }
        </div>
        <div>
          { this.renderSplit() }
        </div>
        <div>
          { this.renderWithdraw() }
        </div>
      </div>
    );
  }
}

export default App;
