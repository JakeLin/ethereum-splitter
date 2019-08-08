pragma solidity >=0.4.21 <0.6.0;

import "./SafeMath.sol";

contract Splitter {
  using SafeMath for uint256;

  event LogSplitted(address indexed sender, uint256 amount, address indexed beneficiary1, address indexed beneficiary2);
  event LogWithdrawn(address indexed sender, uint256 amount);

  address public owner;
  mapping (address => uint256) public beneficiaries;

  constructor() public {
    owner = msg.sender;
  }

  modifier onlyOwner() {
    require (msg.sender == owner, "Only owner can split!");
    _;
  }

  function split(address _beneficiary1, address _beneficiary2) external payable onlyOwner() {
    require(_beneficiary1 != address(0) && _beneficiary2 != address(0), "Beneficiary's address must not be zero!");
    require(msg.value > 0, "Must split more than zero ether!");
    require(msg.value.mod(2) == 0, "The ether to be splitted must be even!");

    uint256 half = msg.value.div(2);
    beneficiaries[_beneficiary1] = beneficiaries[_beneficiary1].add(half);
    beneficiaries[_beneficiary2] = beneficiaries[_beneficiary2].add(half);
    emit LogSplitted(msg.sender, msg.value, _beneficiary1, _beneficiary2);
  }

  // function withdraw() external {
  //   require(msg.sender == bob || msg.sender == carol, "Only Bob or Carol can withdraw!");
  //   if (msg.sender == bob) {
  //     uint256 tempBobBalance = bobBalance;
  //     require(tempBobBalance > 0, "Bob's balance must be grater than zero!");
  //     bobBalance = 0;
  //     msg.sender.transfer(tempBobBalance);
  //     emit LogBobWithdrawn(tempBobBalance);
  //   } else if (msg.sender == carol) {
  //     uint256 tempCarolBalance = carolBalance;
  //     require(tempCarolBalance > 0, "Carol's balance must be grater than zero!");
  //     carolBalance = 0;
  //     msg.sender.transfer(tempCarolBalance);
  //     emit LogCarolWithdrawn(tempCarolBalance);
  //   }
  // }
}
