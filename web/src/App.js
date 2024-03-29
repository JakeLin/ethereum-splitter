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

class App extends Component {
  state = {
    owner: '',
    balances: [],
    hasError: false,
    message: '',
    contractLoaded: false,
    accountAddress: '',
    etherToSplit: '1',
    beneficiary1Address: '',
    beneficiary2Address: '',
    contract: null,
    accounts: [],
    contractBalance: null,
    network: null,
    web3: null,
    contractAddress: null,
  };

  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
  }

  async componentDidMount() {
    try {
      let web3;
      // Checking if Web3 has been injected by the browser (Mist/MetaMask)
      if (typeof window.web3 !== 'undefined') {
        // Use Mist/MetaMask's provider.
        web3 = new Web3(window.web3.currentProvider);
        console.log('Web3 Detected! ' + web3.currentProvider.constructor.name);
      } else {
        console.log('No Web3 Detected, use local node 127.0.0.1:8545');
        web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:8545'));
      }

      const accounts = await web3.eth.getAccounts();
      if (accounts.length === 0) {
        this.setState({ hasError: true, message: 'Please sign in MetaMask and refresh the page!' });
        return;
      }

      const networkId = await web3.eth.net.getId();
      const contractAddress = networks[networkId].address;
      const contract = new web3.eth.Contract(abi, contractAddress)
      const network = await web3.eth.net.getNetworkType();
      const owner = await contract.methods.getOwner().call();
      const contractBalance = web3.utils.fromWei(await web3.eth.getBalance(contractAddress));
      this.setState({ web3, contract, owner, contractBalance, accounts, network, contractAddress, contractLoaded: true });
    } catch(e) {
      console.error(e);
      this.setState({ hasError: true, message: 'Something went wrong!' });
    }
  }

  handleChange = (event) => {
    this.setState({ [event.target.name]: event.target.value });
  };

  renderContractInfo = () => {
    const { contractLoaded, network, contractBalance, contractAddress } = this.state;
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
      this.setState({ accountBalanceMessage: 'Accournt address is invalid!' });
      return;
    }
    const balance = web3.utils.fromWei(await contract.methods.balances(accountAddress).call(), 'ether');
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
          id="text-field"
          name="accountAddress"
          label="Account address"
          className="text-field"
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
        <div className="message">
          { accountBalanceMessage }
        </div>
      </Card>
    );
  };

  split = async () => {
    const { web3, contract, accounts, etherToSplit, beneficiary1Address, beneficiary2Address, contractAddress } = this.state;
    if (!web3.utils.isAddress(beneficiary1Address)) {
      this.setState({ splitMessage: 'Beneficiary 1 address is invalid!' });
      return;
    } else if (!web3.utils.isAddress(beneficiary2Address)) {
      this.setState({ splitMessage: 'Beneficiary 2 address is invalid!' });
      return;
    }

    try {
      this.setState({ splitMessage: 'Submitting the transaction.' });
      const tx = await contract.methods.split(beneficiary1Address, beneficiary2Address).send({
        from: accounts[0],
        value: web3.utils.toWei(etherToSplit, 'ether')
      }).on("transactionHash", txHash => {
        this.setState({ splitMessage: `Transaction ${txHash} submitted, waiting for the network to mine` });
      });
      if (tx.status) {
        const contractBalance = web3.utils.fromWei(await web3.eth.getBalance(contractAddress));
        this.setState({ splitMessage: `Transaction ${tx.transactionHash} got mined successfully.`, contractBalance });
      } else {
        this.setState({ splitMessage: `Something went wrong with transaction ${tx.transactionHash}.` });
      }
    } catch(e) {
      this.setState({ splitMessage: e.message });
    }
  };

  renderSplit = () => {
    const { contractLoaded, etherToSplit, beneficiary1Address, beneficiary2Address, splitMessage } = this.state;
    if (!contractLoaded) {
      return null;
    }

    return (
      <Card className="card">
        <TextField
          id="ether-to-split"
          name="etherToSplit"
          label="Ether to split"
          className="text-field"
          type="number"
          value={etherToSplit}
          onChange={this.handleChange}
          margin="normal"
          variant="outlined"
        />
        <TextField
          id="beneficiary1-address"
          name="beneficiary1Address"
          label="Beneficiary 1 Address"
          className="text-field"
          value={beneficiary1Address}
          onChange={this.handleChange}
          margin="normal"
          variant="outlined"
        />
        <TextField
          id="beneficiary2-address"
          name="beneficiary2Address"
          label="Beneficiary 2 Address"
          className="text-field"
          value={beneficiary2Address}
          onChange={this.handleChange}
          margin="normal"
          variant="outlined"
        />
        <Button 
          variant="contained" 
          color="primary"
          onClick={this.split}>
          Split
        </Button>
        <div className="message">
          { splitMessage }
        </div>
      </Card>
    );
  };

  withdraw = async () => {
    const { web3, contract, accounts, contractAddress } = this.state;

    try {
      this.setState({ withdrawMessage: 'Submitting the transaction.' });
      const tx = await contract.methods.withdraw().send({
        from: accounts[0]
      }).on("transactionHash", txHash => {
        this.setState({ withdrawMessage: `Transaction ${txHash} submitted, waiting for the network to mine` });
      });
      if (tx.status) {
        const contractBalance = web3.utils.fromWei(await web3.eth.getBalance(contractAddress));
        this.setState({ withdrawMessage: `Transaction ${tx.transactionHash} got mined successfully.`, contractBalance });
      } else {
        this.setState({ withdrawMessage: `Something went wrong with transaction ${tx.transactionHash}.` });
      };
    } catch(e) {
      this.setState({ withdrawMessage: e.message });
    }
  };

  renderWithdraw = () => {
    const { contractLoaded, withdrawMessage } = this.state;
    if (!contractLoaded) {
      return null;
    }

    return (
      <Card className="card">
        <Button 
          variant="contained" 
          color="primary"
          onClick={this.withdraw}>
          Withdraw
        </Button>
        <div className="message">
          { withdrawMessage }
        </div>
      </Card>
    );
  };

  renderError = () => {
    const { contractLoaded, hasError, message } = this.state;
    if (contractLoaded && !hasError) {
      return null;
    }

    return (
      <span className="error-message">{ message }</span>
    );
  };

  render() {
    return (
      <div className="cards">
        { this.renderContractInfo() }
        { this.renderCheckAccountBalances() }
        { this.renderSplit() }
        { this.renderWithdraw() }
        { this.renderError() }
      </div>
    );
  }
}

export default App;
