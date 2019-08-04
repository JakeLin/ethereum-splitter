var SafeMath = artifacts.require("./SafeMath.sol");
var Splitter = artifacts.require("./Splitter.sol");

var bob = "0x978ddD545eA2a1C73B690Fa8557Edf748e385252";
var carol = "0x2c6A4E13E56c93B86aE9bf6030E6C1062f61ff62";
module.exports = function(deployer) {
  deployer.deploy(SafeMath);
  deployer.deploy(Splitter, bob, carol);
};