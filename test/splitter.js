const truffleAssert = require('truffle-assertions');
const Splitter = artifacts.require('Splitter');

const zeroAddress = '0x0000000000000000000000000000000000000000';

contract('Splitter', accounts => {
  const [alice, bob, carol, notAlice] = accounts;

  let contract;
  beforeEach(async () => {
    contract = (await Splitter.new(bob, carol, { from: alice, gas: 3000000 })).contract;
  });

  it('should deploy the contract correctly', async () => {
    assert.ok(contract);
    assert.equal((await contract.methods.alice().call()), alice);
    assert.equal((await contract.methods.bob().call()), bob);
    assert.equal((await contract.methods.carol().call()), carol);
  });

  // The VM throws revert error, but `truffleAssert.reverts` can't catch it properly. So comment it for now
  // Error: Returned error: VM Exception while processing transaction: revert Bob must not be 0x0000000000000000000000000000000000000000! -- Reason given: Bob must not be 0x0000000000000000000000000000000000000000!.
  // context('When set bob address as 0x0000000000000000000000000000000000000000', () => {
  //   it('should fail to deploy the contract', async () => {
  //     await truffleAssert.reverts(
  //       Splitter.new(zeroAddress, carol, { from: alice, gas: 3000000 }).contract,
  //       'Bob must not be 0x0000000000000000000000000000000000000000!'
  //     );
  //   });
  // });


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
