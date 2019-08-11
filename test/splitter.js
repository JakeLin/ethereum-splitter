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
      assert.strictEqual((await contract.methods.balances(bob).call()), toWei('0.01', 'ether'));
      assert.strictEqual((await contract.methods.balances(carol).call()), toWei('0.01', 'ether'));
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
        'Ownable: caller is not the owner'
      );
    });
  });

  context('When the beneficiary withdraws', () => {
    let bobBeforeWithdrawBalance;
    let tx;
    beforeEach(async () => {
      // Arrange
      bobBeforeWithdrawBalance = toBN(await web3.eth.getBalance(bob));
      await contract.methods.split(bob, carol).send({from: owner, value: toWei('0.06', 'ether')});

      // Act
      tx = await contract.methods.withdraw().send({from: bob});
    });

    it('should withdraw the ether to Bob\'s account', async () => {
      // Assert
      const gasPrice = toBN(await web3.eth.getGasPrice());
      const gasFee = toBN(tx.gasUsed).mul(gasPrice);
      assert.strictEqual(toBN((await web3.eth.getBalance(bob))).sub(bobBeforeWithdrawBalance).toString(10), toBN(toWei('0.03', 'ether')).sub(gasFee).toString(10));
    });

    it('Bob\'s balance in the contract should set to zero', async () => {
      // Assert
      assert.strictEqual((await contract.methods.balances(bob).call()), '0');
    });

    it('the contract balance should decrease to 0.03 ether', async () => {
      // Assert
      assert.strictEqual((await web3.eth.getBalance(contract.options.address)), toWei('0.03', 'ether'));
    });

    it('should emit the LogWithdrawn event', async () => {
      // Assert
      assert.strictEqual(tx.events.LogWithdrawn.event, 'LogWithdrawn');
      assert.strictEqual(tx.events.LogWithdrawn.returnValues.sender, bob);
      assert.strictEqual(tx.events.LogWithdrawn.returnValues.amount, toWei('0.03', 'ether'));
    });
  });

  context('When the balance is zero', () => {
    it('should fail to withdraw for Bob', async () => {
      // Act & Assert
      await truffleAssert.reverts(
        contract.methods.withdraw().send({from: bob}),
        'Balance must be grater than zero to withdraw!'
      );
    });
  });

  context('When someone else withdraws', () => {
    beforeEach(async () => {
      // Arrange
      await contract.methods.split(bob, carol).send({from: owner, value: toWei('0.06', 'ether')});
    });

    it('should fail to withdraw', async () => {
      // Act & Assert
      await truffleAssert.reverts(
        contract.methods.withdraw().send({from: someoneElse}),
        'Balance must be grater than zero to withdraw!'
      );
    });
  });
});
