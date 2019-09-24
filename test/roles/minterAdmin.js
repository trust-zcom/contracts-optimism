
const Token = artifacts.require("Token");
const truffleAssert = require('truffle-assertions');

contract("MinterAdmin.sol", (accounts) => {
  let contractInstance;
  let owner = accounts[0];
  let admin = accounts[1];
  let capper = accounts[2];
  let prohibiter = accounts[3];
  let pauser = accounts[4];
  let minterAdmin = accounts[5];
  let minter = accounts[6];

  var initialize =  async () => {
    contractInstance = await Token.new();
    await contractInstance.initialize('A', 'a', 1, owner, admin, capper, prohibiter, pauser, minterAdmin, minter);
  }

  describe('Test changeMinter function', function() {
    beforeEach(initialize);
    
    it("MinterAdmin can change the minter", async () => {
      let new_minter = accounts[11];
      let changeMinter_tx = await contractInstance.changeMinter(new_minter, {from: minterAdmin});
      await truffleAssert.eventEmitted(changeMinter_tx, 'MinterChanged', {oldMinter: minter, newMinter: new_minter, sender: minterAdmin}, 'MinterChanged event should be emitted with correct parameters');
    });

    it("non minterAdmin cannot change the minter", async () => {
      let non_minterAdmin = accounts[11];
      let new_minter = accounts[12];
      await truffleAssert.reverts(
        contractInstance.changeMinter(new_minter, {from: non_minterAdmin}),
        truffleAssert.ErrorType.REVERT,
        'This should be a fail test case!'
      );
    });

    it("paused contract cannot change the minter", async () => {
      let new_minter = accounts[11];
      await contractInstance.pause({from: pauser});
      await truffleAssert.reverts(
        contractInstance.changeMinter(new_minter, {from: minterAdmin}),
        truffleAssert.ErrorType.REVERT,
        'This should be a fail test case!'
      );
    });

    it("cannot change the minter to zero address", async () => {
      let new_minter = 0;
      await truffleAssert.fails(
        contractInstance.changeMinter(new_minter, {from: minterAdmin}),
        null,
        null,
        'This should be a fail test case!'
      );
    });
  });
})