pragma solidity >=0.4.21 <0.6.0;

import "./Ownable.sol";

contract Pausable is Ownable {
  event LogPaused(address indexed account);
  event LogUnpaused(address indexed account);

  bool private paused;

  constructor(bool _paused) public {
    paused = _paused;
  }

  modifier whenRunning() {
    require(!paused, "Can't do that when the contract is paused!");
    _;
  }

  function isPaused() public view returns (bool) {
    return paused;
  }

  function pause() public onlyOwner whenRunning {
    paused = true;
    emit LogPaused(msg.sender);
  }

  function resume() public onlyOwner {
    require(paused, "Can't resume a non-paused contract!");
    paused = false;
    emit LogUnpaused(msg.sender);
  }
}
