pragma solidity >=0.4.21 <0.6.0;

import "./Ownable.sol";

contract Pausable is Ownable {
  event LogPaused(address account);
  event LogUnpaused(address account);

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

  function unPause() public onlyOwner {
    require(paused, "Can't unPause a non-paused contract!");
    paused = false;
    emit LogUnpaused(msg.sender);
  }
}
