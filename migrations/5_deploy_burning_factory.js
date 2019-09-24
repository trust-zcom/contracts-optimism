const BurningFactory = artifacts.require("BurningFactory");

module.exports = function(deployer) {
  deployer.deploy(BurningFactory, "0x9741c78988fd4e184b9c8b583a4203407f12884b", "0xbf12853e54da72ca23e58ee0cc574e0b3ddbf4bc");
};
