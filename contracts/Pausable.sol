pragma solidity >=0.4.21 <0.6.0;

contract Pausable {
  address public owner;
  bool public paused;

  constructor() public {
    owner = msg.sender;
  }

  modifier onlyOwner() {
    require(msg.sender == owner, "Only owner can do this!");
    _;
  }

  modifier whenNotPaused() {
    require(!paused, "Can't do that when the contract is paused!");
    _;
  }

  function pause() public onlyOwner {
    require(!paused, "Can't pause a paused contract!");
    paused = true;
  }

  function unPause() public onlyOwner {
    require(paused, "Can't unPause a non-paused contract!");
    paused = false;
  }
}
