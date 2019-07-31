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
    beforeEach(async () => {
      // Arrange & Act
      await contract.methods.split().send({from: alice, value: web3.utils.toWei('0.02', 'ether')});
    });

    it('should split the ether to Bob and Carol\'s balance evenly', async () => {
      // Assert
      assert.equal((await contract.methods.bobBalance().call()), web3.utils.toWei('0.01', 'ether'));
      assert.equal((await contract.methods.carolBalance().call()), web3.utils.toWei('0.01', 'ether'));
    });

    it('the contract balance should increase 0.02 ether', async () => {
      // Assert
      assert.equal((await web3.eth.getBalance(contract.options.address)), web3.utils.toWei('0.02', 'ether'));
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
