pragma solidity >=0.4.21 <0.6.0;

import "./Ownable.sol";

contract Pausable is Ownable {
  event LogPaused(address indexed account);
  event LogUnpaused(address indexed account);

  bool private paused = false;

  modifier whenNotPaused() {
    require(!paused, "Can't do that when the contract is paused!");
    _;
  }

  function isPaused() public view returns (bool) {
    return paused;
  }

  function pause() public onlyOwner {
    require(!paused, "Can't pause a paused contract!");
    paused = true;
    emit LogPaused(msg.sender);
  }

  function unpause() public onlyOwner {
    require(paused, "Can't unpause a non-paused contract!");
    paused = false;
    emit LogUnpaused(msg.sender);
  }
}
