pragma solidity >=0.4.21 <0.6.0;

import "./SafeMath.sol";
import "./Pausable.sol";

contract Splitter is Pausable {
  using SafeMath for uint256;

  event LogSplitted(address indexed sender, uint256 amount, address indexed beneficiary1, address indexed beneficiary2);
  event LogWithdrawn(address indexed sender, uint256 amount);

  mapping (address => uint256) public balances;

  constructor(bool paused) Pausable(paused) public {
  }

  function split(address _beneficiary1, address _beneficiary2) external payable whenRunning whenAlive {
    require(_beneficiary1 != address(0) && _beneficiary2 != address(0), "Beneficiary's address must not be zero!");
    require(msg.value > 0, "Must split more than zero ether!");

    if (msg.value.mod(2) == 1) {
      balances[msg.sender] = balances[msg.sender].add(1);
    }
    uint256 half = msg.value.div(2);
    balances[_beneficiary1] = balances[_beneficiary1].add(half);
    balances[_beneficiary2] = balances[_beneficiary2].add(half);
    emit LogSplitted(msg.sender, msg.value, _beneficiary1, _beneficiary2);
  }

  function withdraw() external whenRunning whenAlive {
    uint256 balanceToWithdraw = balances[msg.sender];
    require(balanceToWithdraw > 0, "Balance must be grater than zero to withdraw!");
    balances[msg.sender] = 0;
    emit LogWithdrawn(msg.sender, balanceToWithdraw);
    msg.sender.transfer(balanceToWithdraw);
  }

  function withdrawAll() external onlyOwner whenKilled {
    uint256 balanceToWithdraw = address(this).balance;
    emit LogWithdrawn(msg.sender, balanceToWithdraw);
    msg.sender.transfer(balanceToWithdraw);
  }
}
