import React, { Component } from 'react';

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import Card from '@material-ui/core/Card';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';

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
    contractLoaded: false,
    accountAddress: ''
  };

  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
  }

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

  handleChange = (event) => {
    this.setState({ [event.target.name]: event.target.value });
  };

  renderContractInfo = () => {
    const { contractLoaded, network, contractBalance } = this.state;
    if (contractLoaded) {
      const url = `//ropsten.etherscan.io/address/${contractAddress}`
      return (
        <Card className="card">
          <Table>
            <TableBody>
              <TableRow key="network">
                <TableCell align="right">Network</TableCell>
                <TableCell align="left">{network}</TableCell>
              </TableRow>
              <TableRow key="contract-address">
                <TableCell align="right">Contract address</TableCell>
                <TableCell align="left"><a href={url} target="_blank" rel="noopener noreferrer">{contractAddress}</a></TableCell>
              </TableRow>
              <TableRow key="contract-balance">
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

  checkAccountBalance = async () => {
    const { web3, contract, accountAddress } = this.state;
    if (!web3.utils.isAddress(accountAddress)) {
      this.setState({ accountBalanceMessage: 'Invalid address!' });
      return;
    }
    const balance = await contract.methods.balances(accountAddress).call();
    const accountBalanceMessage = `${accountAddress} balance is ${balance} ether.`
    this.setState({ accountBalanceMessage });
  };

  renderCheckAccountBalances = () => {
    const { contractLoaded, accountAddress, accountBalanceMessage } = this.state;
    if (!contractLoaded) {
      return null;
    }

    return (
      <Card className="card">
        <TextField
          id="account-address"
          name="accountAddress"
          label="Account address"
          className="account-address"
          value={accountAddress}
          onChange={this.handleChange}
          margin="normal"
          variant="outlined"
        />
        <Button 
          variant="contained" 
          color="primary"
          onClick={this.checkAccountBalance}>
          Check account balance
        </Button>
        <div className="account-balance-message">
          { accountBalanceMessage }
        </div>
      </Card>
    );
  };

  renderSplit = () => {
    const { contractLoaded } = this.state;
    if (!contractLoaded) {
      return null;
    }
  };

  renderWithdraw = () => {
    const { contractLoaded } = this.state;
    if (!contractLoaded) {
      return null;
    }
  };

  render() {
    return (
      <div className="cards">
        { this.renderContractInfo() }
        { this.renderCheckAccountBalances() }
        { this.renderSplit() }
        { this.renderWithdraw() }
      </div>
    );
  }
}

export default App;
