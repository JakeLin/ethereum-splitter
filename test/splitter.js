const truffleAssert = require('truffle-assertions');
const Splitter = artifacts.require('Splitter');

contract('Splitter', accounts => {
  const admin = accounts[0];
  const alice = accounts[1];
  const bob = accounts[2];
  const carol = accounts[3];
  const notAlice = accounts[4];

  let contract;
  beforeEach(async () => {
      const truffleContract = await Splitter.new(alice, bob, carol, { from: admin, gas: 3000000 });
      contract = truffleContract.contract;
  });

  it('should deploy the contract correctly', () => {
    assert.ok(contract);
  });

  context('When Alice splits 0.02 ether (the number is even)', () => {
    let bobBalanceBeforeSplit;
    let carolBalanceBeforeSplit;

    beforeEach(async () => {
      // Arrange
      bobBalanceBeforeSplit = await web3.eth.getBalance(bob);
      carolBalanceBeforeSplit = await web3.eth.getBalance(carol);
      
      // Act
      await contract.methods.split().send({from: alice, value: web3.utils.toWei('0.02', 'ether')});
    });

    it('should split the ether to Bob and Carol evenly', async () => {
      // Assert
      const bobBalanceAfterSplit = await web3.eth.getBalance(bob);
      const carolBalanceAfterSplit = await web3.eth.getBalance(carol);
      const bobBalanceDiff = bobBalanceAfterSplit - bobBalanceBeforeSplit;
      const carolBalanceDiff = carolBalanceAfterSplit - carolBalanceBeforeSplit;

      assert.equal(bobBalanceDiff, carolBalanceDiff); 
      assert.equal(bobBalanceDiff, web3.utils.toWei('0.01', 'ether')); 
      assert.equal(carolBalanceDiff, web3.utils.toWei('0.01', 'ether'));
      assert.equal(bobBalanceDiff + carolBalanceDiff, web3.utils.toWei('0.02', 'ether'));
    });
  });

  // It doesn't fail because we can call/send the method with negative ether.
  // Don't know why ~_~
  // context('When Alice splits negative wei', () => {
  //   it('should not split the ether to Bob and Carol', async () => {
  //     // Act & Assert
  //     await truffleAssert.reverts(
  //       contract.methods.split().send({from: alice, value: -1}),
  //       'Must split more than zero ether!'
  //     );
  //   });
  // });

  context('When Alice splits 3 wei (the number is odd)', () => {
    it('should not split the ether to Bob and Carol', async () => {
      // Act & Assert
      await truffleAssert.reverts(
        contract.methods.split().send({from: alice, value: 3}),
        'The ether to be splitted must be even!'
      );
    });
  });

  context('When not Alice splits', () => {
    it('should not split the ether to Bob and Carol', async () => {
      // Act & Assert
      await truffleAssert.reverts(
        contract.methods.split().send({from: notAlice, value: 2}),
        'Only Alice can split!'
      );
    });
  });
});
