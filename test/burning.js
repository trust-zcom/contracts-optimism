const BurningFactory = artifacts.require("BurningFactory");
const Burning = artifacts.require("Burning");
const Token = artifacts.require("Token");
const truffleAssert = require('truffle-assertions');

contract("Burning.sol", (accounts) => {
  let tokenInstance;
  let burningFactoryInstance;
  let burningFactoryOwner = accounts[0];
  let tokenOwner = accounts[1];
  let manager = accounts[2];
  let burner = accounts[3];
  
  describe('Test burn function', function() {
    beforeEach(async () => {
      burningFactoryInstance = await BurningFactory.new(manager, burner, {from: burningFactoryOwner});
      tokenInstance = await Token.new();
      await tokenInstance.initialize('A', 'a', 1, tokenOwner, tokenOwner, tokenOwner, tokenOwner, tokenOwner, tokenOwner, tokenOwner);
    });
    
    it("Burner can burn", async () => {
      let deploy_tx = await burningFactoryInstance.deploy();
      let burning_address = deploy_tx.logs[0].args.burning;
      let burning_instance = await Burning.at(burning_address);
      await tokenInstance.cap(100, {from: tokenOwner});
      await tokenInstance.mint(burning_address, 10, {from: tokenOwner});
      await burning_instance.burn(tokenInstance.address, 9, {from: burner});
      let balance = await tokenInstance.balanceOf(burning_address);
      assert.strictEqual(balance.toNumber(), 1, "Balance after burn not correct!");
    });

    it("Non burner cannot burn", async () => {
      let non_burner = accounts[4];
      let deploy_tx = await burningFactoryInstance.deploy();
      let burning_address = deploy_tx.logs[0].args.burning;
      let burning_instance = await Burning.at(burning_address);
      await tokenInstance.cap(100, {from: tokenOwner});
      await tokenInstance.mint(burning_address, 10, {from: tokenOwner});
      await truffleAssert.reverts(
        burning_instance.burn(tokenInstance.address, 9, {from: non_burner}),
        truffleAssert.ErrorType.REVERT,
        'This should be a fail test case!'
      );
    });
  });
})