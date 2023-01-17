const Token = artifacts.require("OpToken_v1");
const ZUSD = artifacts.require("ZUSD");
const truffleAssert = require('truffle-assertions');
const Web3EthAbi = require('web3-eth-abi');
const { signERC2612Permit } = require('./utils/signERC2612Permit.js')
const abi = require("../build/contracts/OpToken_v1.json").abi;

const [initializeAbi] = abi.filter((f) => f.name === 'initialize');

contract("ZUSD.sol", (accounts) => {
  let tokenInstance;
  let zusdInstance;
  let owner = accounts[0];
  let admin = accounts[1];
  let prohibiter = accounts[3];
  let pauser = accounts[4];
  let proxyAdmin = accounts[7];
  let wiper = accounts[8];
  let rescuer = accounts[9];
  let l1Address = accounts[10];
  let l2Gateway = accounts[14];

  let data = Web3EthAbi.encodeFunctionCall(initializeAbi, ['Z.com Arbitrum', 'ZUSD', 6, owner, admin, prohibiter, pauser, wiper, rescuer, l1Address, l2Gateway]);
  let zero_address = '0x0000000000000000000000000000000000000000';

  var initialize =  async () => {
    tokenInstance = await Token.new();
    zusdProxy = await ZUSD.new(tokenInstance.address, proxyAdmin, data);
    zusdInstance = await Token.at(zusdProxy.address);
  }

  describe('Test implementation of AdminUpgradeabilityProxy', function() {
    beforeEach(initialize);

    it("Admin can view address of implementation", async () => {
      let address = await zusdProxy.implementation.call({from: proxyAdmin});
      assert.strictEqual(address, tokenInstance.address, "Implementation address not correct!");
    });

    it("Non admin cannot view address of implementation", async () => {
      let non_admin = accounts[11];
      await truffleAssert.reverts(
        zusdProxy.implementation.call({from: non_admin}),
        truffleAssert.ErrorType.REVERT,
        'This should be a fail test case!'
      );
    });
  });

  describe('Test admin of AdminUpgradeabilityProxy', function() {
    beforeEach(initialize);

    it("Admin can view address of admin", async () => {
      let address = await zusdProxy.admin.call({from: proxyAdmin});
      assert.strictEqual(address, proxyAdmin, "Implementation address not correct!");
    });

    it("Non admin cannot view address of admin", async () => {
      let non_admin = accounts[11];
      await truffleAssert.reverts(
        zusdProxy.implementation.call({from: non_admin}),
        truffleAssert.ErrorType.REVERT,
        'This should be a fail test case!'
      );
    });
  });

  describe('Test changeAdmin of AdminUpgradeabilityProxy', function() {
    beforeEach(initialize);

    it("Admin can change admin of proxy", async () => {
      let new_admin = accounts[11];
      let changeAdmin_tx = await zusdProxy.changeAdmin(new_admin, {from: proxyAdmin});
      let admin = await zusdProxy.admin.call({from: new_admin});
      await truffleAssert.eventEmitted(changeAdmin_tx, 'AdminChanged', {previousAdmin: proxyAdmin, newAdmin: new_admin}, 'AdminChanged event should be emitted with correct parameters');
      await assert.strictEqual(new_admin, admin, "Admin address is not correct!");
    });

    it("Non admin cannot change admin of proxy", async () => {
      let non_admin =  accounts[11];
      let new_admin = accounts[12];
      await truffleAssert.reverts(
        zusdProxy.changeAdmin(new_admin, {from: non_admin}),
        truffleAssert.ErrorType.REVERT,
        'This should be a fail test case!'
      );
    });

    it("Cannot change admin of proxy to zero address", async () => {
      await truffleAssert.reverts(
        zusdProxy.changeAdmin(zero_address, {from: proxyAdmin}),
        truffleAssert.ErrorType.REVERT,
        'This should be a fail test case!'
      );
    });
  });

  describe('Test upgradeTo of AdminUpgradeabilityProxy', function() {
    beforeEach(initialize);

    it("Admin can upgrade the implementation of proxy", async () => {
      let new_implementation = await Token.new();
      let upgrade_tx = await zusdProxy.upgradeTo(new_implementation.address, {from: proxyAdmin});
      await truffleAssert.eventEmitted(upgrade_tx, 'Upgraded', {implementation: new_implementation.address}, 'Upgraded event should be emitted with correct parameters');
    });

    it("Non admin cannot upgrade the implementation of proxy", async () => {
      let non_admin = accounts[11];
      let new_implementation = await Token.new();
      await truffleAssert.reverts(
        zusdProxy.upgradeTo(new_implementation.address, {from: non_admin}),
        truffleAssert.ErrorType.REVERT,
        'This should be a fail test case!'
      );
    });

    it("Cannot upgrade implementation to non contract address", async () => {
      await truffleAssert.fails(
        zusdProxy.upgradeTo(accounts[11], {from: admin}),
        null,
        null,
        'This should be a fail test case!'
      );
      await truffleAssert.fails(
        zusdProxy.upgradeTo(zero_address, {from: admin}),
        null,
        null,
        'This should be a fail test case!'
      );
    })
  });

  describe('Test initialize function', function() {
    beforeEach(initialize);

    it("Initialize cannot call multiple times", async () => {
      await truffleAssert.reverts(
        zusdInstance.initialize('B', 'b', 1, owner, admin, prohibiter, pauser, wiper, rescuer, l1Address, l2Gateway),
        truffleAssert.ErrorType.REVERT,
        'This should be a fail test case!'
      );
    });

  });

  describe('Test mint function', function() {
    beforeEach(initialize);
    // l2Gateway can create mint pending transaction
    it("l2Gateway can mint", async () => {
      let mint_address = accounts[11];
      await zusdInstance.mint(mint_address, 10, {from: l2Gateway});

      const balance = await zusdInstance.balanceOf(mint_address);
      assert.strictEqual(balance.toNumber(), 10, "Balance after mint not correct!");
    });
  
    it("non l2Gateway cannot mint", async () => {
      let non_minter = accounts[11];
      let mint_address = accounts[12];
      await truffleAssert.reverts(
        zusdInstance.mint(mint_address, 10, {from: non_minter}),
        truffleAssert.ErrorType.REVERT,
        'This should be a fail test case!'
      );
    });
  
    it("mint address should not be zero", async () => {
      await truffleAssert.reverts(
        zusdInstance.mint(zero_address, 10, {from: l2Gateway}),
        truffleAssert.ErrorType.REVERT,
        'This should be a fail test case!'
      );
    })

    it("mint should change the totalSupply", async () => {
      let mint_address = accounts[11];
      let old_totalSupply = await zusdInstance.totalSupply();
      await zusdInstance.mint(mint_address, 10, {from: l2Gateway});
      let new_totalSupply = await zusdInstance.totalSupply();
      assert.strictEqual(old_totalSupply.toNumber() + 10, new_totalSupply.toNumber(), "totalSupply not change after mint");
    })
  });

  describe('Test transfer function', function() {
    beforeEach(initialize);

    it("transfer success case", async () => {
      let sender = accounts[11];
      let recipient = accounts[12];
      await zusdInstance.mint(sender, 10, {from: l2Gateway});

      let transfer_tx = await zusdInstance.transfer(recipient, 10, {from: sender});
      await truffleAssert.eventEmitted(transfer_tx, 'Transfer', null, 'Transfer event should be emitted with correct parameters');
      balance = await zusdInstance.balanceOf(recipient);
      assert.strictEqual(balance.toNumber(), 10, "Balance of recipient not correct!");
    });
    
    it("prohibited account cannot transfer", async () => {
      let prohibited_sender = accounts[11];
      let recipient = accounts[12];
      await zusdInstance.mint(prohibited_sender, 10, {from: l2Gateway});
      await zusdInstance.prohibit(prohibited_sender, {from: prohibiter});
      await truffleAssert.reverts(
        zusdInstance.transfer(recipient, 10, {from: prohibited_sender}),
        truffleAssert.ErrorType.REVERT,
        'This should be a fail test case!'
      );
    });

    it("prohibited recipient account cannot receive", async () => {
      let sender = accounts[11];
      let recipient = accounts[12];
      await zusdInstance.mint(sender, 10, {from: l2Gateway});
      await zusdInstance.prohibit(recipient, {from: prohibiter});
      await truffleAssert.reverts(
        zusdInstance.transfer(recipient, 10, {from: sender}),
        truffleAssert.ErrorType.REVERT,
        'This should be a fail test case!'
      );
    });

    it("paused contract cannot do transfer", async () => {
      let sender = accounts[11];
      let recipient = accounts[12];
      await zusdInstance.mint(sender, 10, {from: l2Gateway});
      await zusdInstance.pause({from: pauser});
      await truffleAssert.reverts(
        zusdInstance.transfer(recipient, 10, {from: sender}),
        truffleAssert.ErrorType.REVERT,
        'This should be a fail test case!'
      );
    });

    it("recipient address should not be zero", async () => {
      let sender = accounts[11];
      await zusdInstance.mint(sender, 10, {from: l2Gateway});
      await truffleAssert.reverts(
        zusdInstance.transfer(zero_address, 10, {from: sender}),
        truffleAssert.ErrorType.REVERT,
        'This should be a fail test case!'
      );
    });

    it("transfer with amount over balance should fail", async () => {
      let sender = accounts[11];
      let recipient = accounts[12];
      await zusdInstance.mint(sender, 10, {from: l2Gateway});
      await truffleAssert.reverts(
        zusdInstance.transfer(recipient, 11, {from: sender}),
        truffleAssert.ErrorType.REVERT,
        'This should be a fail test case!'
      );
    });

    it("transfer with amount over balance should fail", async () => {
      let sender = accounts[11];
      let recipient = accounts[12];
      await zusdInstance.mint(sender, 10, {from: l2Gateway});
      await zusdInstance.transfer(recipient, 9, {from: sender});
      await truffleAssert.reverts(
        zusdInstance.transfer(recipient, 2, {from: sender}),
        truffleAssert.ErrorType.REVERT,
        'This should be a fail test case!'
      );
    });

    it("cannot transfer with amount is not a natural number", async () => {
      let sender = accounts[11];
      let recipient = accounts[12];
      await zusdInstance.mint(sender, 10, {from: l2Gateway});
      await truffleAssert.reverts(
        zusdInstance.transfer(recipient, 0, {from: sender}),
        truffleAssert.ErrorType.REVERT,
        'This should be a fail test case!'
      );
    });
  });

  describe('Test transferFrom function', function() {
    beforeEach(initialize);

    it("transferFrom success case", async () => {
      let sender = accounts[11]
      let recipient = accounts[12];
      let spender = accounts[13];
      await zusdInstance.mint(sender, 10, {from: l2Gateway});
      await zusdInstance.approve(spender, 10, {from: sender});
      let transfer_tx = await zusdInstance.transferFrom(sender, recipient, 10, {from: spender});
      await truffleAssert.eventEmitted(transfer_tx, 'Transfer', null, 'Transfer event should be emitted with correct parameters');
      balance = await zusdInstance.balanceOf(recipient);
      assert.strictEqual(balance.toNumber(), 10, "Balance of recipient not correct!");
    });

    it("prohibited sender cannot transfer", async () => {
      let prohibited_sender = accounts[11];
      let recipient = accounts[12];
      let spender = accounts[13];
      await zusdInstance.mint(prohibited_sender, 10, {from: l2Gateway});
      await zusdInstance.approve(spender, 10, {from: prohibited_sender});
      await zusdInstance.prohibit(prohibited_sender, {from: prohibiter});
      await truffleAssert.reverts(
        zusdInstance.transferFrom(prohibited_sender, recipient, 10, {from: spender}),
        truffleAssert.ErrorType.REVERT,
        'This should be a fail test case!'
      );
    });

    it("prohibited recipient cannot receive", async () => {
      let sender = accounts[11];
      let recipient = accounts[12];
      let spender = accounts[13];
      await zusdInstance.mint(sender, 10, {from: l2Gateway});
      await zusdInstance.approve(spender, 10, {from: sender});
      await zusdInstance.prohibit(recipient, {from: prohibiter});
      await truffleAssert.reverts(
        zusdInstance.transferFrom(sender, recipient, 10, {from: spender}),
        truffleAssert.ErrorType.REVERT,
        'This should be a fail test case!'
      );
    });

    it("paused contract cannot do transfer", async () => {
      let sender = accounts[11];
      let recipient = accounts[12];
      let spender = accounts[13];
      await zusdInstance.mint(sender, 10, {from: l2Gateway});
      await zusdInstance.approve(spender, 10, {from: sender});
      await zusdInstance.pause({from: pauser});
      await truffleAssert.reverts(
        zusdInstance.transferFrom(sender, recipient, 10, {from: spender}),
        truffleAssert.ErrorType.REVERT,
        'This should be a fail test case!'
      );
    });

    it("transfer amount that hasn't been approved should fail", async () => {
      let sender = accounts[11]
      let recipient = accounts[12];
      let spender = accounts[13];
      await zusdInstance.mint(sender, 10, {from: l2Gateway});
      await truffleAssert.reverts(
        zusdInstance.transferFrom(sender, recipient, 1, {from: spender}),
        truffleAssert.ErrorType.REVERT,
        'This should be a fail test case!'
      );
    });

    it("transfer amount exceed approved amount should fail", async () => {
      let sender = accounts[11];
      let recipient = accounts[12];
      let spender = accounts[13];
      await zusdInstance.mint(sender, 10, {from: l2Gateway});
      await zusdInstance.approve(spender, 10, {from: sender});
      await truffleAssert.reverts(
        zusdInstance.transferFrom(sender, recipient, 11, {from: spender}),
        truffleAssert.ErrorType.REVERT,
        'This should be a fail test case!'
      );
    });

    it("transfer amount exceed approved amount should fail", async () => {
      let sender = accounts[1];
      let recipient = accounts[2];
      let spender = accounts[3];
      await zusdInstance.mint(sender, 10, {from: l2Gateway});
      await zusdInstance.approve(spender, 10, {from: sender});
      await zusdInstance.transferFrom(sender, recipient, 9, {from: spender});
      await truffleAssert.reverts(
        zusdInstance.transferFrom(sender, recipient, 2, {from: spender}),
        truffleAssert.ErrorType.REVERT,
        'This should be a fail test case!'
      );
    });

    it("recipient address should not be zero", async () => {
      let sender = accounts[11];
      let spender = accounts[12];
      await zusdInstance.mint(sender, 10, {from: l2Gateway});
      await zusdInstance.approve(spender, 10, {from: sender});
      await truffleAssert.reverts(
        zusdInstance.transferFrom(sender, zero_address, 10, {from: spender}),
        truffleAssert.ErrorType.REVERT,
        'This should be a fail test case!'
      );
    });

    it("cannot transferFrom with amount is not a natural number", async () => {
      let sender = accounts[1];
      let recipient = accounts[2];
      let spender = accounts[3];
      await zusdInstance.mint(sender, 10, {from: l2Gateway});
      await zusdInstance.approve(spender, 10, {from: sender});

      await truffleAssert.reverts(
        zusdInstance.transferFrom(sender, recipient, 0, {from: spender}),
        truffleAssert.ErrorType.REVERT,
        'This should be a fail test case!'
      );
    });
  });

  describe('Test burn function', function() {
    beforeEach(initialize);
    
    it("burn success case", async () => {
      let burn_account = accounts[11];
      await zusdInstance.mint(burn_account, 10, {from: l2Gateway});
      let burn_tx = await zusdInstance.burn(burn_account, 5, {from: l2Gateway});
      await truffleAssert.eventEmitted(burn_tx, 'Burn', (ev) => {
        return ev.burnee === burn_account && ev.amount.toNumber() === 5 && ev.sender === l2Gateway;
      }, 'Burn event should be emitted with correct parameters');
      balance = await zusdInstance.balanceOf(burn_account);
      assert.strictEqual(balance.toNumber(), 5, "Balance of recipient not correct!");
    });

    it("burn should change the totalSupply", async () => {
      let burn_account = accounts[11];
      await zusdInstance.mint(burn_account, 10, {from: l2Gateway});
      let old_totalSupply = await zusdInstance.totalSupply();
      await zusdInstance.burn(burn_account, 5, {from: l2Gateway});
      let new_totalSupply = await zusdInstance.totalSupply();
      assert.strictEqual(old_totalSupply.toNumber() - 5, new_totalSupply.toNumber(), "totalSupply not change after burn!");
    });

    it("burn exceed the balance of account should fail", async () => {
      let burn_account = accounts[11];
      await zusdInstance.mint(burn_account, 10, {from: l2Gateway});
      await truffleAssert.reverts(
        zusdInstance.burn(burn_account, 11, {from: l2Gateway}),
        truffleAssert.ErrorType.REVERT,
        'This should be a fail test case!'
      );
    });

    it("burn exceed the balance of account should fail", async () => {
      let burn_account = accounts[11];
      await zusdInstance.mint(burn_account, 10, {from: l2Gateway});
      await zusdInstance.burn(burn_account, 9, {from: l2Gateway});
      await truffleAssert.reverts(
        zusdInstance.burn(burn_account, 2, {from: l2Gateway}),
        truffleAssert.ErrorType.REVERT,
        'This should be a fail test case!'
      );
    });
  });

  describe('Test approve function', function() {
    beforeEach(initialize);

    it("initial allowance should be zero", async () => {
      let approver = accounts[11];
      let spender = accounts[12];
      let initial_allowance = await zusdInstance.allowance(approver, spender);
      assert.strictEqual(initial_allowance.toNumber(), 0, "Initial allowance not correct!");
    });

    it("approve should change the allowance", async () => {
      let approver = accounts[11];
      let spender = accounts[12];
      let old_allowance = await zusdInstance.allowance(approver, spender);
      //await zusdInstance.mint(approver, 10, {from: l2Gateway});
      await zusdInstance.approve(spender, 9, {from: approver});
      let new_allowance = await zusdInstance.allowance(approver, spender);
      assert.strictEqual(old_allowance.toNumber() + 9, new_allowance.toNumber(), "Allowance after approve not correct!");
    });
  });

  describe('Test permit function', function() {
    beforeEach(initialize);

    let approver = accounts[11];
    let spender = accounts[12];
    let gaspender = accounts[13];

    it("can permit with signature", async () => {
      let nonce = await zusdInstance.nonces(approver);
      nonce = nonce.toString();
      const name = await zusdInstance.name();
      let chainid = await zusdInstance.deploymentChainId();;
      chainid = chainid.toString();
      const permitResult = await signERC2612Permit(
        web3.currentProvider,
        zusdInstance.address,
        approver,
        spender,
        '10',
        null,
        nonce,
        name,
        chainid,
        '1',
      );
      let old_allowance = await zusdInstance.allowance(approver, spender);
      await zusdInstance.permit(
        approver,
        spender,
        '10',
        permitResult.deadline,
        permitResult.v,
        permitResult.r,
        permitResult.s,
        {from: gaspender}
      );

      let new_allowance = await zusdInstance.allowance(approver, spender);
      assert.strictEqual(old_allowance.toNumber() + 10, new_allowance.toNumber(), "Allowance after approve not correct!");
    });

    it("permit expired", async () => {
      let nonce = await zusdInstance.nonces(approver);
      nonce = nonce.toString();
      const name = await zusdInstance.name();
      let chainid = await zusdInstance.deploymentChainId();;
      chainid = chainid.toString();
      const permitResult = await signERC2612Permit(
        web3.currentProvider,
        zusdInstance.address,
        approver,
        spender,
        '10',
        '1',
        nonce,
        name,
        chainid,
        '1',
      );

      await truffleAssert.reverts(
        zusdInstance.permit(
          approver,
          spender,
          '10',
          '1',
          permitResult.v,
          permitResult.r,
          permitResult.s,
          {from: gaspender}
        ),
        truffleAssert.ErrorType.REVERT,
        'This should be a fail test case!'
      );
    });

    it("invalid permit", async () => {
      let nonce = await zusdInstance.nonces(approver);
      nonce = nonce.toString();
      const name = await zusdInstance.name();
      let chainid = await zusdInstance.deploymentChainId();;
      chainid = chainid.toString();
      const permitResult = await signERC2612Permit(
        web3.currentProvider,
        zusdInstance.address,
        approver,
        spender,
        '10',
        null,
        nonce,
        name,
        chainid,
        '1',
      );

      await truffleAssert.reverts(
        zusdInstance.permit(
          approver,
          spender,
          '100',
          permitResult.deadline,
          permitResult.v,
          permitResult.r,
          permitResult.s,
          {from: gaspender}
        ),
        truffleAssert.ErrorType.REVERT,
        'This should be a fail test case!'
      );
    });
  });

  describe('Test updateMetadata function', function() {
    beforeEach(initialize);

    let approver = accounts[11];
    let spender = accounts[12];
    let gaspender = accounts[13];

    it("updateMetadata and can permit with signature", async () => {

      const newname = 'new name';
      const newsymbol = 'NEWS';
      
      let up_tx = await zusdInstance.updateMetadata(newname,newsymbol, {from: rescuer});
      await truffleAssert.eventEmitted(up_tx, 'UpdateMetadata', (ev) => {
        return ev._newName === newname && ev._newSymbol === newsymbol;
      }, 'UpdateMetadata event should be emitted with correct parameters');

      const name = await zusdInstance.name();
      const symbol = await zusdInstance.symbol();
      assert.strictEqual(name, newname, "name not correct!");
      assert.strictEqual(symbol, newsymbol, "symbol not correct!");

      let nonce = await zusdInstance.nonces(approver);
      nonce = nonce.toString();

      let chainid = await zusdInstance.deploymentChainId();;
      chainid = chainid.toString();
      const permitResult = await signERC2612Permit(
        web3.currentProvider,
        zusdInstance.address,
        approver,
        spender,
        '10',
        null,
        nonce,
        name,
        chainid,
        '1',
      );
      let old_allowance = await zusdInstance.allowance(approver, spender);
      await zusdInstance.permit(
        approver,
        spender,
        '10',
        permitResult.deadline,
        permitResult.v,
        permitResult.r,
        permitResult.s,
        {from: gaspender}
      );

      let new_allowance = await zusdInstance.allowance(approver, spender);
      assert.strictEqual(old_allowance.toNumber() + 10, new_allowance.toNumber(), "Allowance after approve not correct!");
    });

    it("Non rescuer cannot updateMetadata", async () => {
      let non_rescuer =  accounts[11];

      await truffleAssert.reverts(
        zusdInstance.updateMetadata('a','A', {from: non_rescuer}),
        truffleAssert.ErrorType.REVERT,
        'This should be a fail test case!'
      );
    });
  });
})