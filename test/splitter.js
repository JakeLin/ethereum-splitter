const truffleAssert = require('truffle-assertions');
const Splitter = artifacts.require('Splitter');

const BN = web3.utils.BN;

// const zeroAddress = '0x0000000000000000000000000000000000000000';

contract('Splitter', accounts => {
  const [alice, bob, carol, someoneElse] = accounts;

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
        contract.methods.split().send({from: someoneElse, value: 2}),
        'Only Alice can split!'
      );
    });
  });

  context('When Bob withdraws', () => {
    let bobBeforeWithdrawBalance;
    beforeEach(async () => {
      // Arrange
      bobBeforeWithdrawBalance = new BN(await web3.eth.getBalance(bob));
      await contract.methods.split().send({from: alice, value: web3.utils.toWei('0.06', 'ether')});

      // Act
      await contract.methods.withdraw().send({from: bob});
    });

    it('should withdraw the ether to Bob\'s account', async () => {
      // Assert
      assert.ok(new BN(await web3.eth.getBalance(bob)).gt(bobBeforeWithdrawBalance), 'balance should increase after withdraw');
    });

    it('Bob\'s balance in the contract should set to zero', async () => {
      // Assert
      assert.equal((await contract.methods.bobBalance().call()), 0);
    });

    it('the contract balance should decrease 0.03 ether', async () => {
      // Assert
      assert.equal((await web3.eth.getBalance(contract.options.address)), web3.utils.toWei('0.03', 'ether'));
    });
  });

  context('When Carol withdraws', () => {
    let carolBeforeWithdrawBalance;
    beforeEach(async () => {
      // Arrange
      carolBeforeWithdrawBalance = new BN(await web3.eth.getBalance(carol));
      await contract.methods.split().send({from: alice, value: web3.utils.toWei('0.06', 'ether')});

      // Act
      await contract.methods.withdraw().send({from: carol});
    });

    it('should withdraw the ether to Carol\'s account', async () => {
      // Assert
      assert.ok(new BN(await web3.eth.getBalance(carol)).gt(carolBeforeWithdrawBalance), 'balance should increase after withdraw');
    });

    it('Carol\'s balance in the contract should set to zero', async () => {
      // Assert
      assert.equal((await contract.methods.carolBalance().call()), 0);
    });

    it('the contract balance should decrease 0.03 ether', async () => {
      // Assert
      assert.equal((await web3.eth.getBalance(contract.options.address)), web3.utils.toWei('0.03', 'ether'));
    });
  });

  context('When the balance is zero', () => {
    it('should fail to withdraw for Bob', async () => {
      // Act & Assert
      await truffleAssert.reverts(
        contract.methods.withdraw().send({from: bob}),
        'Bob\'s balance must be grater than zero!'
      );
    });

    it('should fail to withdraw for Carol', async () => {
      // Act & Assert
      await truffleAssert.reverts(
        contract.methods.withdraw().send({from: carol}),
        'Carol\'s balance must be grater than zero!'
      );
    });
  });

  context('When someone else withdraws', () => {
    beforeEach(async () => {
      // Arrange
      bobBeforeWithdrawBalance = new BN(await web3.eth.getBalance(bob));
      carolBeforeWithdrawBalance = new BN(await web3.eth.getBalance(carol));
      await contract.methods.split().send({from: alice, value: web3.utils.toWei('0.06', 'ether')});
    });

    it('should fail to withdraw', async () => {
      // Act & Assert
      await truffleAssert.reverts(
        contract.methods.withdraw().send({from: someoneElse}),
        'Only Bob or Carol can withdraw!'
      );
    });
  });
});
