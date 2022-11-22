
const Token = artifacts.require("OpToken_v1");
const truffleAssert = require('truffle-assertions');

contract("Owner.sol", (accounts) => {
  let contractInstance;
  let owner = accounts[0];
  let admin = accounts[1];
  let wiper = accounts[2];
  let prohibiter = accounts[3];
  let pauser = accounts[4];
  let rescuer = accounts[5];
  let l1Address = accounts[6];
  let l2Gateway = accounts[7];
  let zero_address = '0x0000000000000000000000000000000000000000'

  var initialize =  async () => {
    contractInstance = await Token.new();
    await contractInstance.initialize('A', 'a', 1, owner, admin, prohibiter, pauser, wiper, rescuer, l1Address, l2Gateway);
  }

  describe('Test changeOwner function', function() {
    beforeEach(initialize);
    
    it("owner can change the owner", async () => {
      let new_owner = accounts[11];
      let changeOwner_tx = await contractInstance.changeOwner(new_owner, {from: owner});
      await truffleAssert.eventEmitted(changeOwner_tx, 'OwnerChanged', {oldOwner: owner, newOwner: new_owner, sender: owner}, 'OwnerChanged event should be emitted with correct parameters');
    });

    it("non owner cannot change the owner", async () => {
      let non_owner = accounts[11];
      let new_owner = accounts[12];
      await truffleAssert.reverts(
        contractInstance.changeOwner(new_owner, {from: non_owner}),
        truffleAssert.ErrorType.REVERT,
        'This should be a fail test case!'
      );
    });

    it("paused contract cannot change the owner", async () => {
      let new_owner = accounts[11];
      await contractInstance.pause({from: pauser});
      await truffleAssert.reverts(
        contractInstance.changeOwner(new_owner, {from: owner}),
        truffleAssert.ErrorType.REVERT,
        'This should be a fail test case!'
      );
    });

    it("cannot change the owner to zero address", async () => {
      await truffleAssert.reverts(
        contractInstance.changeOwner(zero_address, {from: owner}),
        truffleAssert.ErrorType.REVERT,
        'This should be a fail test case!'
      );
    });
  });

  describe('Test changeAdmin function', function() {
    beforeEach(initialize);
    
    it("owner can change the admin", async () => {
      let new_admin = accounts[11];
      let changeAdmin_tx = await contractInstance.changeAdmin(new_admin, {from: owner});
      await truffleAssert.eventEmitted(changeAdmin_tx, 'AdminChanged', {oldAdmin: admin, newAdmin: new_admin, sender: owner}, 'AdminChanged event should be emitted with correct parameters');
    });

    it("non owner cannot change the admin", async () => {
      let non_owner = accounts[11];
      let new_admin = accounts[12];
      await truffleAssert.reverts(
        contractInstance.changeAdmin(new_admin, {from: non_owner}),
        truffleAssert.ErrorType.REVERT,
        'This should be a fail test case!'
      );
    });

    it("cannot change the admin to zero address", async () => {
      await truffleAssert.reverts(
        contractInstance.changeAdmin(zero_address),
        truffleAssert.ErrorType.REVERT,
        'This should be a fail test case!'
      );
    });
  });
})
