const Token = artifacts.require("ArbToken_v1");
const truffleAssert = require('truffle-assertions');

contract("Rescuer.sol", (accounts) => {
  let contractInstance;
  let owner = accounts[0];
  let admin = accounts[1];
  let wiper = accounts[2];
  let prohibiter = accounts[3];
  let pauser = accounts[4];
  let rescuer = accounts[5];
  let l1Address = accounts[6];
  let l2Gateway = accounts[7];

  var initialize =  async () => {
    contractInstance = await Token.new();
    await contractInstance.initialize('A', 'a', 1, owner, admin, prohibiter, pauser, wiper, rescuer, l1Address, l2Gateway);
  }


  describe('Test rescue function', function() {
    beforeEach(initialize);

    it("rescuer can rescue", async () => {
      let token_recever_address = accounts[12];
      await contractInstance.bridgeMint(contractInstance.address, 10, {from: l2Gateway});
      let balance_gyen = await contractInstance.balanceOf(contractInstance.address);
      assert.strictEqual(balance_gyen.toNumber(), 10, "GYEN contract balance is not correct!");

      let rescue_tx = await contractInstance.rescue(contractInstance.address,token_recever_address,6, {from: rescuer});
      await truffleAssert.eventEmitted(rescue_tx, 'Rescue', (ev) => {
        return ev.tokenAddr === contractInstance.address && ev.toAddr === token_recever_address && ev.amount.toNumber() === 6;
      }, 'rescue event should be emitted with correct parameters');
      let balance_receiver = await contractInstance.balanceOf(token_recever_address);
      assert.strictEqual(balance_receiver.toNumber(), 6, "Rescue receiver balance is not correct!");
      balance_gyen = await contractInstance.balanceOf(contractInstance.address);
      assert.strictEqual(balance_gyen.toNumber(), 4, "GYEN contract balance is not correct afer 1st rescue!");

      rescue_tx = await contractInstance.rescue(contractInstance.address,token_recever_address,4, {from: rescuer});
      await truffleAssert.eventEmitted(rescue_tx, 'Rescue', (ev) => {
        return ev.tokenAddr === contractInstance.address && ev.toAddr === token_recever_address && ev.amount.toNumber() === 4;
      }, 'rescue event should be emitted with correct parameters');
      balance_receiver = await contractInstance.balanceOf(token_recever_address);
      assert.strictEqual(balance_receiver.toNumber(), 10, "Rescue receiver balance is not correct!");
      balance_gyen = await contractInstance.balanceOf(contractInstance.address);
      assert.strictEqual(balance_gyen.toNumber(), 0, "GYEN contract balance is not correct afer 2nd rescue!");
    });

    it("non rescuer cannot rescue", async () => {
      let token_recever_address = accounts[12];
      let non_rescuer = accounts[13];
      await contractInstance.bridgeMint(contractInstance.address, 10, {from: l2Gateway});

      await truffleAssert.reverts(
        contractInstance.rescue(contractInstance.address,token_recever_address,6, {from: non_rescuer}),
        truffleAssert.ErrorType.REVERT,
        'This should be a fail test case!'
      );
    });

    it("paused contract cannot rescue", async () => {
      let token_recever_address = accounts[12];
      await contractInstance.bridgeMint(contractInstance.address, 10, {from: l2Gateway});
      await contractInstance.pause({from: pauser});

      await truffleAssert.reverts(
        contractInstance.rescue(contractInstance.address,token_recever_address,6, {from: rescuer}),
        truffleAssert.ErrorType.REVERT,
        'This should be a fail test case!'
      );
    });

    it("can not rescue more than balance", async () => {
      let token_recever_address = accounts[12];
      await contractInstance.bridgeMint(contractInstance.address, 10, {from: l2Gateway});

      await truffleAssert.reverts(
        contractInstance.rescue(contractInstance.address,token_recever_address,11, {from: rescuer}),
        truffleAssert.ErrorType.REVERT,
        'This should be a fail test case!'
      );
    });

    it("rescue should not change the totalSupply", async () => {
      let token_recever_address = accounts[12];
      await contractInstance.bridgeMint(contractInstance.address, 10, {from: l2Gateway});

      let old_totalSupply = await contractInstance.totalSupply();
      await contractInstance.rescue(contractInstance.address,token_recever_address,10, {from: rescuer});

      let new_totalSupply = await contractInstance.totalSupply();

      assert.strictEqual(old_totalSupply.toNumber(), new_totalSupply.toNumber(), "totalSupply not change after rescue");
    });
  });
})