pragma solidity >=0.4.21 <0.6.0;

contract Splitter {
  address public alice;
  address payable public bob;
  address payable public carol;

  constructor(address payable _bob, address payable _carol) public {
    require(_bob != address(0), "Bob must not be 0x0000000000000000000000000000000000000000!");
    require(_carol != address(0), "Carol must not be 0x0000000000000000000000000000000000000000!");
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
    require(msg.value % 2 == 0, "The ether to be splitted must be even!");
    uint256 half = msg.value / 2;
    bob.transfer(half);
    carol.transfer(half);
  }
}
