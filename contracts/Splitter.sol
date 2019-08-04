pragma solidity >=0.4.21 <0.6.0;

import "./SafeMath.sol";

contract Splitter {
  using SafeMath for uint256;

  event LogAliceSplitted(uint256 amount);
  event LogBobWithdrawn(uint256 amount);
  event LogCarolWithdrawn(uint256 amount);

  address public alice;
  address public bob;
  address public carol;

  uint256 public bobBalance;
  uint256 public carolBalance;

  constructor(address _bob, address _carol) public {
    require(_bob != address(0), "Bob must not be zero!");
    require(_carol != address(0), "Carol must not be zero!");
    alice = msg.sender;
    bob = _bob;
    carol = _carol;
  }

  modifier onlyAlice() {
    require (msg.sender == alice, "Only Alice can split!");
    _;
  }

  function split() external payable onlyAlice() {
    require(msg.value > 0, "Must split more than zero ether!");
    require(msg.value.mod(2) == 0, "The ether to be splitted must be even!");

    uint256 half = msg.value.div(2);
    bobBalance = bobBalance.add(half);
    carolBalance = carolBalance.add(half);
    emit LogAliceSplitted(msg.value);
  }

  function withdraw() external {
    require(msg.sender == bob || msg.sender == carol, "Only Bob or Carol can withdraw!");
    if (msg.sender == bob) {
      uint256 tempBobBalance = bobBalance;
      require(tempBobBalance > 0, "Bob's balance must be grater than zero!");
      bobBalance = 0;
      msg.sender.transfer(tempBobBalance);
      emit LogBobWithdrawn(tempBobBalance);
    } else if (msg.sender == carol) {
      uint256 tempCarolBalance = carolBalance;
      require(tempCarolBalance > 0, "Carol's balance must be grater than zero!");
      carolBalance = 0;
      msg.sender.transfer(tempCarolBalance);
      emit LogCarolWithdrawn(tempCarolBalance);
    }
  }
}
