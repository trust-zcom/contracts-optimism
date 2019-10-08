const config = require('config');
const BurningFactory = artifacts.require("BurningFactory");

module.exports = function(deployer) {
  deployer.deploy(BurningFactory, config.get('burning_factory_manager'), config.get('burner'));
};
