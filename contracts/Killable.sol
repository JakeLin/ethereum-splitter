pragma solidity >=0.4.21 <0.6.0;

import "./Ownable.sol";

contract Killable is Ownable {
  event LogKilled(address indexed account);

  bool private killed;

  modifier whenAlive() {
    require(!killed, "Can't do that when the contract is killed!");
    _;
  }

  function isKilled() public view returns (bool) {
    return killed;
  }

  function kill() public onlyOwner whenAlive {
    killed = true;
    emit LogKilled(msg.sender);
  }
}
