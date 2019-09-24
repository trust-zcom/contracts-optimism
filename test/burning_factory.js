const BurningFactory = artifacts.require("BurningFactory");
const truffleAssert = require('truffle-assertions');

contract("BurningFactory.sol", (accounts) => {
  let burningFactoryInstance;
  let burningFactoryOwner = accounts[0];
  let manager = accounts[1];
  let burner = accounts[2];
  
  describe('Test deploy function', function() {
    beforeEach(async () => {
      burningFactoryInstance = await BurningFactory.new(manager, burner, {from: burningFactoryOwner});
    });
    
    it("Can deploy new burning", async () => {
      let deploy_tx = await burningFactoryInstance.deploy({from: burningFactoryOwner});
      await truffleAssert.eventEmitted(deploy_tx, 'Deployed', null, 'Deployed event should be emitted with correct parameters');
    });
  });

  describe('Test changeBurner function', function() {
    beforeEach(async () => {
      burningFactoryInstance = await BurningFactory.new(manager, burner, {from: burningFactoryOwner});
    });
    
    it("Manager can change burner", async () => {
      let new_burner = accounts[3];
      let changeBurner_tx = await burningFactoryInstance.changeBurner(new_burner, {from: manager});
      await truffleAssert.eventEmitted(changeBurner_tx, 'BurnerChanged', {newBurner: new_burner, sender: manager}, 'BurnerChanged event should be emitted with correct parameters');
      let burner = await burningFactoryInstance.burner();
      assert.strictEqual(new_burner, burner, "New burner not correct!");
    });

    it("non manager cannot change burner", async () => {
      let non_manager = accounts[3];
      let new_burner = accounts[4];
      await truffleAssert.reverts(
        burningFactoryInstance.changeBurner(new_burner, {from: non_manager}),
        truffleAssert.ErrorType.REVERT,
        'This should be a fail test case!'
      );
    });

    it("burner address should not be zero", async () => {
      let new_burner = 0;
      await truffleAssert.fails(
        burningFactoryInstance.changeBurner(new_burner, {from: manager}),
        null,
        null,
        'This should be a fail test case!'
      );
    });
  });
})