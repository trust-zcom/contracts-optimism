const Token = artifacts.require("ArbToken_v1");
const truffleAssert = require('truffle-assertions');

contract("Wiper.sol", (accounts) => {
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


  describe('Test wipe function', function() {
    beforeEach(initialize);

    it("wiper can wipe", async () => {
      let wipe_address = accounts[11];
      await contractInstance.bridgeMint(wipe_address, 10, {from: l2Gateway});
      await contractInstance.prohibit(wipe_address, {from: prohibiter});
      let wipe_tx = await contractInstance.wipe(wipe_address, {from: wiper});
      await truffleAssert.eventEmitted(wipe_tx, 'Wipe', (ev) => {
        return ev.addr === wipe_address && ev.amount.toNumber() === 10;
      }, 'wipe event should be emitted with correct parameters');
      balance = await contractInstance.balanceOf(wipe_address);
      assert.strictEqual(balance.toNumber(), 0, "Balance after wipe not correct!");
    });
  
    it("non wiper cannot wipe", async () => {
      let wipe_address = accounts[11];
      let non_wiper = accounts[12];
      await contractInstance.bridgeMint(wipe_address, 10, {from: l2Gateway});
      await contractInstance.prohibit(wipe_address, {from: prohibiter});

      await truffleAssert.reverts(
        contractInstance.wipe(wipe_address, {from: non_wiper}),
        truffleAssert.ErrorType.REVERT,
        'This should be a fail test case!'
      );
    });
 
    it("no prohibited address cannot be wipe", async () => {
      let wipe_address = accounts[11];
      await contractInstance.bridgeMint(wipe_address, 10, {from: l2Gateway});
      await truffleAssert.reverts(
        contractInstance.wipe(wipe_address, {from: wiper}),
        truffleAssert.ErrorType.REVERT,
        'This should be a fail test case!'
      );
    });

    it("paused contract cannot be wipe", async () => {
      let wipe_address = accounts[11];
      await contractInstance.bridgeMint(wipe_address, 10, {from: l2Gateway});
      await contractInstance.prohibit(wipe_address, {from: prohibiter});
      await contractInstance.pause({from: pauser});

      await truffleAssert.reverts(
        contractInstance.wipe(wipe_address, {from: wiper}),
        truffleAssert.ErrorType.REVERT,
        'This should be a fail test case!'
      );

    });

    it("wipe should change the totalSupply", async () => {
      let wipe_address = accounts[11];
      await contractInstance.bridgeMint(wipe_address, 10, {from: l2Gateway});
      let old_totalSupply = await contractInstance.totalSupply();
      await contractInstance.prohibit(wipe_address, {from: prohibiter});
      await contractInstance.wipe(wipe_address, {from: wiper});
      let new_totalSupply = await contractInstance.totalSupply();

      assert.strictEqual(old_totalSupply.toNumber() - 10, new_totalSupply.toNumber(), "totalSupply not change after wipe");
    })
  });
})