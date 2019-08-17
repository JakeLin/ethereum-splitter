pragma solidity >=0.4.21 <0.6.0;

contract Ownable {
  address private owner;

  constructor() public {
    owner = msg.sender;
  }

  function getOwner() public view returns (address) {
    return owner;
  }

  modifier onlyOwner() {
    require(msg.sender == owner, "Only owner can do this!");
    _;
  }
}
