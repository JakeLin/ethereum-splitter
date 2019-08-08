const truffleAssert = require('truffle-assertions');
const Splitter = artifacts.require('Splitter');

const { toBN, toWei } = web3.utils;

const zeroAddress = '0x0000000000000000000000000000000000000000';

contract('Splitter', accounts => {
  const [owner, bob, carol, someoneElse] = accounts;

  let contract;
  beforeEach(async () => {
    contract = (await Splitter.new({ from: owner, gas: 3000000 })).contract;
  });

  it('should deploy the contract correctly', async () => {
    assert.ok(contract);
    assert.strictEqual((await contract.methods.owner().call()), owner);
  });

  context('When owner splits 0.02 ether (the number is even)', () => {
    let tx;
    beforeEach(async () => {
      // Arrange & Act
      tx = await contract.methods.split(bob, carol).send({from: owner, value: toWei('0.02', 'ether')});
    });

    it('should split the ether to Bob and Carol\'s balance evenly', async () => {
      // Assert
      assert.strictEqual((await contract.methods.beneficiaries(bob).call()), toWei('0.01', 'ether'));
      assert.strictEqual((await contract.methods.beneficiaries(carol).call()), toWei('0.01', 'ether'));
    });

    it('the contract balance should increase 0.02 ether', async () => {
      // Assert
      assert.strictEqual((await web3.eth.getBalance(contract.options.address)), toWei('0.02', 'ether'));
    });

    it('should emit the LogSplitted event', async () => {
      // Assert
      assert.strictEqual(tx.events.LogSplitted.event, 'LogSplitted');
      assert.strictEqual(tx.events.LogSplitted.returnValues.sender, owner);
      assert.strictEqual(tx.events.LogSplitted.returnValues.amount, toWei('0.02', 'ether'));
      assert.strictEqual(tx.events.LogSplitted.returnValues.beneficiary1, bob);
      assert.strictEqual(tx.events.LogSplitted.returnValues.beneficiary2, carol);
    });
  });

  context('When owner splits to zero address', () => {
    it('should fail', async () => {
      // Act & Assert
      await truffleAssert.reverts(
        contract.methods.split(zeroAddress, carol).send({from: owner, value: 2}),
        'Beneficiary\'s address must not be zero!'
      );

      await truffleAssert.reverts(
        contract.methods.split(bob, zeroAddress).send({from: owner, value: 2}),
        'Beneficiary\'s address must not be zero!'
      );
    });
  });

  context('When owner splits 3 wei (the number is odd)', () => {
    it('should fail', async () => {
      // Act & Assert
      await truffleAssert.reverts(
        contract.methods.split(bob, carol).send({from: owner, value: 3}),
        'The ether to be splitted must be even!'
      );
    });
  });

  context('When not owner splits', () => {
    it('should fail', async () => {
      // Act & Assert
      await truffleAssert.reverts(
        contract.methods.split(bob, carol).send({from: someoneElse, value: 2}),
        'Only owner can split!'
      );
    });
  });

  // context('When Bob withdraws', () => {
  //   let bobBeforeWithdrawBalance;
  //   let tx;
  //   beforeEach(async () => {
  //     // Arrange
  //     bobBeforeWithdrawBalance = toBN(await web3.eth.getBalance(bob));
  //     await contract.methods.split().send({from: owner, value: toWei('0.06', 'ether')});

  //     // Act
  //     tx = await contract.methods.withdraw().send({from: bob});
  //   });

  //   it('should withdraw the ether to Bob\'s account', async () => {
  //     // Assert
  //     const gasPrice = toBN(await web3.eth.getGasPrice());
  //     const gasFee = toBN(tx.gasUsed).mul(gasPrice);
  //     assert.strictEqual(toBN((await web3.eth.getBalance(bob))).sub(bobBeforeWithdrawBalance).toString(10), toBN(toWei('0.03', 'ether')).sub(gasFee).toString(10));
  //   });

  //   it('Bob\'s balance in the contract should set to zero', async () => {
  //     // Assert
  //     assert.strictEqual((await contract.methods.bobBalance().call()), '0');
  //   });

  //   it('the contract balance should decrease 0.03 ether', async () => {
  //     // Assert
  //     assert.strictEqual((await web3.eth.getBalance(contract.options.address)), toWei('0.03', 'ether'));
  //   });

  //   it('should emit the LogBobWithdrawn event', async () => {
  //     // Assert
  //     assert.strictEqual(tx.events.LogBobWithdrawn.event, 'LogBobWithdrawn');
  //     assert.strictEqual(tx.events.LogBobWithdrawn.returnValues.amount, toWei('0.03', 'ether'));
  //   });
  // });

  // context('When Carol withdraws', () => {
  //   let carolBeforeWithdrawBalance;
  //   let tx;
  //   beforeEach(async () => {
  //     // Arrange
  //     carolBeforeWithdrawBalance = toBN(await web3.eth.getBalance(carol));
  //     await contract.methods.split().send({from: owner, value: toWei('0.06', 'ether')});

  //     // Act
  //     tx = await contract.methods.withdraw().send({from: carol});
  //   });

  //   it('should withdraw the ether to Carol\'s account', async () => {
  //     // Assert
  //     const gasPrice = toBN(await web3.eth.getGasPrice());
  //     const gasFee = toBN(tx.gasUsed).mul(gasPrice);
  //     assert.strictEqual(toBN((await web3.eth.getBalance(carol))).sub(carolBeforeWithdrawBalance).toString(10), toBN(toWei('0.03', 'ether')).sub(gasFee).toString(10));
  //   });

  //   it('Carol\'s balance in the contract should set to zero', async () => {
  //     // Assert
  //     assert.strictEqual((await contract.methods.carolBalance().call()), '0');
  //   });

  //   it('the contract balance should decrease 0.03 ether', async () => {
  //     // Assert
  //     assert.strictEqual((await web3.eth.getBalance(contract.options.address)), toWei('0.03', 'ether'));
  //   });

  //   it('should emit the LogCarolWithdrawn event', async () => {
  //     // Assert
  //     assert.strictEqual(tx.events.LogCarolWithdrawn.event, 'LogCarolWithdrawn');
  //     assert.strictEqual(tx.events.LogCarolWithdrawn.returnValues.amount, toWei('0.03', 'ether'));
  //   });
  // });

  // context('When the balance is zero', () => {
  //   it('should fail to withdraw for Bob', async () => {
  //     // Act & Assert
  //     await truffleAssert.reverts(
  //       contract.methods.withdraw().send({from: bob}),
  //       'Bob\'s balance must be grater than zero!'
  //     );
  //   });

  //   it('should fail to withdraw for Carol', async () => {
  //     // Act & Assert
  //     await truffleAssert.reverts(
  //       contract.methods.withdraw().send({from: carol}),
  //       'Carol\'s balance must be grater than zero!'
  //     );
  //   });
  // });

  // context('When someone else withdraws', () => {
  //   beforeEach(async () => {
  //     // Arrange
  //     await contract.methods.split().send({from: owner, value: toWei('0.06', 'ether')});
  //   });

  //   it('should fail to withdraw', async () => {
  //     // Act & Assert
  //     await truffleAssert.reverts(
  //       contract.methods.withdraw().send({from: someoneElse}),
  //       'Only Bob or Carol can withdraw!'
  //     );
  //   });
  // });
});
