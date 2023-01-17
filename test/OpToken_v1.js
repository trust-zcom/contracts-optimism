const Token = artifacts.require("OpToken_v1");
const truffleAssert = require('truffle-assertions');
const { signERC2612Permit } = require('./utils/signERC2612Permit.js')

contract("OpToken_v1.sol", (accounts) => {
  let tokenInstance;
  let owner = accounts[0];
  let admin = accounts[1];
  let wiper = accounts[2];
  let prohibiter = accounts[3];
  let pauser = accounts[4];
  let rescuer = accounts[5];
  let l1Address = accounts[6];
  let l2Gateway = accounts[7];
  let zero_address = '0x0000000000000000000000000000000000000000';

  var initialize =  async () => {
    tokenInstance = await Token.new();
    await tokenInstance.initialize('A', 'a', 1, owner, admin, prohibiter, pauser, wiper, rescuer, l1Address, l2Gateway);
  }

  describe('Test initialize function', function() {
    beforeEach(async () => {
      tokenInstance = await Token.new();
    })

    it("Initialize cannot call multiple times", async () => {
      await tokenInstance.initialize('A', 'a', 1, owner, admin, prohibiter, pauser, wiper, rescuer, l1Address, l2Gateway);

      await truffleAssert.reverts(
        tokenInstance.initialize('B', 'b', 1, owner, admin, prohibiter, pauser, wiper, rescuer, l1Address, l2Gateway),
        truffleAssert.ErrorType.REVERT,
        'This should be a fail test case!'
      );
    });

    it("cannot initialize owner to zero address", async () => {
      await truffleAssert.reverts(
        tokenInstance.initialize('A', 'a', 1, zero_address, admin, prohibiter, pauser, wiper, rescuer, l1Address, l2Gateway),
        truffleAssert.ErrorType.REVERT,
        'This should be a fail test case!'
      );
    });

    it("cannot initialize admin to zero address", async () => {
      await truffleAssert.reverts(
        tokenInstance.initialize('A', 'a', 1, owner, zero_address, prohibiter, pauser, wiper, rescuer, l1Address, l2Gateway),
        truffleAssert.ErrorType.REVERT,
        'This should be a fail test case!'
      );
    });

    it("cannot initialize prohibiter to zero address", async () => {
      await truffleAssert.reverts(
        tokenInstance.initialize('A', 'a', 1, owner, admin, zero_address, pauser, wiper, rescuer, l1Address, l2Gateway),
        truffleAssert.ErrorType.REVERT,
        'This should be a fail test case!'
      );
    });

    it("cannot initialize pauser to zero address", async () => {
      await truffleAssert.reverts(
        tokenInstance.initialize('A', 'a', 1, owner, admin, prohibiter, zero_address, wiper, rescuer, l1Address, l2Gateway),
        truffleAssert.ErrorType.REVERT,
        'This should be a fail test case!'
      );
    });

    it("cannot initialize wiper to zero address", async () => {
      await truffleAssert.reverts(
        tokenInstance.initialize('A', 'a', 1, owner, admin, prohibiter, pauser, zero_address, rescuer, l1Address, l2Gateway),
        truffleAssert.ErrorType.REVERT,
        'This should be a fail test case!'
      );
    });

    it("cannot initialize rescuer to zero address", async () => {
      await truffleAssert.reverts(
        tokenInstance.initialize('A', 'a', 1, owner, admin, prohibiter, pauser, wiper, zero_address, l1Address, l2Gateway),
        truffleAssert.ErrorType.REVERT,
        'This should be a fail test case!'
      );
    });

    it("cannot initialize l1Address to zero address", async () => {
      await truffleAssert.reverts(
        tokenInstance.initialize('A', 'a', 1, owner, admin, prohibiter, pauser, wiper, rescuer, zero_address, l2Gateway),
        truffleAssert.ErrorType.REVERT,
        'This should be a fail test case!'
      );
    });

    it("cannot initialize l2Gateway to zero address", async () => {
      await truffleAssert.reverts(
        tokenInstance.initialize('A', 'a', 1, owner, admin, prohibiter, pauser, wiper, rescuer, l1Address, zero_address),
        truffleAssert.ErrorType.REVERT,
        'This should be a fail test case!'
      );
    });
  });

  describe('Test mint function', function() {
    beforeEach(initialize);
    
    it("only l2Gateway can mint", async () => {
      let mint_address = accounts[11];
      let mint_tx = await tokenInstance.mint(mint_address, 10, {from: l2Gateway});
      await truffleAssert.eventEmitted(mint_tx, 'Mint', (ev) => {
        return ev.mintee === mint_address && ev.amount.toNumber() === 10 && ev.sender === l2Gateway;
      }, 'Mint event should be emitted with correct parameters');
      balance = await tokenInstance.balanceOf(mint_address);
      assert.strictEqual(balance.toNumber(), 10, "Balance after mint not correct!");
    });
  
    it("non l2Gateway cannot mint", async () => {
      let non_minter = accounts[11];
      let mint_address = accounts[12];
      await truffleAssert.reverts(
        tokenInstance.mint(mint_address, 10, {from: non_minter}),
        truffleAssert.ErrorType.REVERT,
        'This should be a fail test case!'
      );
    });
  
    it("mint address should not be zero", async () => {
      await truffleAssert.reverts(
        tokenInstance.mint(zero_address, 10, {from: l2Gateway}),
        truffleAssert.ErrorType.REVERT,
        'This should be a fail test case!'
      );
    })

    it("mint should change the totalSupply", async () => {
      let mint_address = accounts[11];
      let old_totalSupply = await tokenInstance.totalSupply();
      await tokenInstance.mint(mint_address, 10, {from: l2Gateway});
      let new_totalSupply = await tokenInstance.totalSupply();
      assert.strictEqual(old_totalSupply.toNumber() + 10, new_totalSupply.toNumber(), "totalSupply not change after mint");
    })
  });

  describe('Test transfer function', function() {
    beforeEach(initialize);

    it("transfer success case", async () => {
      let sender = accounts[11];
      let recipient = accounts[12];
      await tokenInstance.mint(sender, 10, {from: l2Gateway});
      let transfer_tx = await tokenInstance.transfer(recipient, 10, {from: sender});
      await truffleAssert.eventEmitted(transfer_tx, 'Transfer', null, 'Transfer event should be emitted with correct parameters');
      balance = await tokenInstance.balanceOf(recipient);
      assert.strictEqual(balance.toNumber(), 10, "Balance of recipient not correct!");
    });
    
    it("prohibited account cannot transfer", async () => {
      let prohibited_sender = accounts[11];
      let recipient = accounts[12];
      await tokenInstance.mint(prohibited_sender, 10, {from: l2Gateway});
      await tokenInstance.prohibit(prohibited_sender, {from: prohibiter});
      await truffleAssert.reverts(
        tokenInstance.transfer(recipient, 10, {from: prohibited_sender}),
        truffleAssert.ErrorType.REVERT,
        'This should be a fail test case!'
      );
    });

    it("paused contract cannot do transfer", async () => {
      let sender = accounts[11];
      let recipient = accounts[12];
      await tokenInstance.mint(sender, 10, {from: l2Gateway});
      await tokenInstance.pause({from: pauser});
      await truffleAssert.reverts(
        tokenInstance.transfer(recipient, 10, {from: sender}),
        truffleAssert.ErrorType.REVERT,
        'This should be a fail test case!'
      );
    });

    it("recipient address should not be zero", async () => {
      let sender = accounts[11];
      await tokenInstance.mint(sender, 10, {from: l2Gateway});
      await truffleAssert.reverts(
        tokenInstance.transfer(zero_address, 10, {from: sender}),
        truffleAssert.ErrorType.REVERT,
        'This should be a fail test case!'
      );
    });

    it("transfer with amount over balance should fail", async () => {
      let sender = accounts[11];
      let recipient = accounts[12];
      await tokenInstance.mint(sender, 10, {from: l2Gateway});
      await truffleAssert.reverts(
        tokenInstance.transfer(recipient, 11, {from: sender}),
        truffleAssert.ErrorType.REVERT,
        'This should be a fail test case!'
      );
    });

    it("transfer with amount over balance should fail", async () => {
      let sender = accounts[11];
      let recipient = accounts[12];
      await tokenInstance.mint(sender, 10, {from: l2Gateway});
      await tokenInstance.transfer(recipient, 9, {from: sender});
      await truffleAssert.reverts(
        tokenInstance.transfer(recipient, 2, {from: sender}),
        truffleAssert.ErrorType.REVERT,
        'This should be a fail test case!'
      );
    });

    it("cannot transfer with amount is not a natural number", async () => {
      let sender = accounts[11];
      let recipient = accounts[12];
      await tokenInstance.mint(sender, 10, {from: l2Gateway});
      
      await truffleAssert.reverts(
        tokenInstance.transfer(recipient, 0, {from: sender}),
        truffleAssert.ErrorType.REVERT,
        'This should be a fail test case!'
      );
    });

    it("cannot transfer to prohibited recipient", async () => {
      let sender = accounts[11];
      let recipient = accounts[12];
      await tokenInstance.mint(sender, 10, {from: l2Gateway});
      await tokenInstance.prohibit(recipient, {from: prohibiter});

      await truffleAssert.reverts(
        tokenInstance.transfer(recipient, 10, {from: sender}),
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
      await tokenInstance.mint(sender, 10, {from: l2Gateway});
      await tokenInstance.approve(spender, 10, {from: sender});
      let transfer_tx = await tokenInstance.transferFrom(sender, recipient, 10, {from: spender});
      await truffleAssert.eventEmitted(transfer_tx, 'Transfer', null, 'Transfer event should be emitted with correct parameters');
      balance = await tokenInstance.balanceOf(recipient);
      assert.strictEqual(balance.toNumber(), 10, "Balance of recipient not correct!");
    });

    it("prohibited sender cannot transfer", async () => {
      let prohibited_sender = accounts[11];
      let recipient = accounts[12];
      let spender = accounts[13];
      await tokenInstance.mint(prohibited_sender, 10, {from: l2Gateway});
      await tokenInstance.approve(spender, 10, {from: prohibited_sender});
      await tokenInstance.prohibit(prohibited_sender, {from: prohibiter});
      await truffleAssert.reverts(
        tokenInstance.transferFrom(prohibited_sender, recipient, 10, {from: spender}),
        truffleAssert.ErrorType.REVERT,
        'This should be a fail test case!'
      );
    });

    it("paused contract cannot do transfer", async () => {
      let sender = accounts[11];
      let recipient = accounts[12];
      let spender = accounts[13];
      await tokenInstance.mint(sender, 10, {from: l2Gateway});
      await tokenInstance.approve(spender, 10, {from: sender});
      await tokenInstance.pause({from: pauser});
      await truffleAssert.reverts(
        tokenInstance.transferFrom(sender, recipient, 10, {from: spender}),
        truffleAssert.ErrorType.REVERT,
        'This should be a fail test case!'
      );
    });

    it("transfer amount that hasn't been approved should fail", async () => {
      let sender = accounts[11]
      let recipient = accounts[12];
      let spender = accounts[13];
      await tokenInstance.mint(sender, 10, {from: l2Gateway});
      await truffleAssert.reverts(
        tokenInstance.transferFrom(sender, recipient, 1, {from: spender}),
        truffleAssert.ErrorType.REVERT,
        'This should be a fail test case!'
      );
    });

    it("transfer amount exceed approved amount should fail", async () => {
      let sender = accounts[11];
      let recipient = accounts[12];
      let spender = accounts[13];
      await tokenInstance.mint(sender, 10, {from: l2Gateway});
      await tokenInstance.approve(spender, 10, {from: sender});
      await truffleAssert.reverts(
        tokenInstance.transferFrom(sender, recipient, 11, {from: spender}),
        truffleAssert.ErrorType.REVERT,
        'This should be a fail test case!'
      );
    });

    it("transfer amount exceed approved amount should fail", async () => {
      let sender = accounts[1];
      let recipient = accounts[2];
      let spender = accounts[3];
      await tokenInstance.mint(sender, 10, {from: l2Gateway});
      await tokenInstance.approve(spender, 10, {from: sender});
      await tokenInstance.transferFrom(sender, recipient, 9, {from: spender});
      await truffleAssert.reverts(
        tokenInstance.transferFrom(sender, recipient, 2, {from: spender}),
        truffleAssert.ErrorType.REVERT,
        'This should be a fail test case!'
      );
    });

    it("recipient address should not be zero", async () => {
      let sender = accounts[11];
      let spender = accounts[12];
      await tokenInstance.mint(sender, 10, {from: l2Gateway});
      await tokenInstance.approve(spender, 10, {from: sender});
      await truffleAssert.reverts(
        tokenInstance.transferFrom(sender, zero_address, 10, {from: spender}),
        truffleAssert.ErrorType.REVERT,
        'This should be a fail test case!'
      );
    });

    it("cannot transferFrom with amount is not a natural number", async () => {
      let sender = accounts[1];
      let recipient = accounts[2];
      let spender = accounts[3];
      await tokenInstance.mint(sender, 10, {from: l2Gateway});
      await tokenInstance.approve(spender, 10, {from: sender});

      await truffleAssert.reverts(
        tokenInstance.transferFrom(sender, recipient, 0, {from: spender}),
        truffleAssert.ErrorType.REVERT,
        'This should be a fail test case!'
      );
    });

    it("cannot transferFrom to prohibited recipient address", async () => {
      let sender = accounts[11];
      let spender = accounts[12];
      let recipient = accounts[13];
      await tokenInstance.mint(sender, 10, {from: l2Gateway});
      await tokenInstance.approve(spender, 10, {from: sender});
      await tokenInstance.prohibit(recipient, {from: prohibiter});
      await truffleAssert.reverts(
        tokenInstance.transferFrom(sender, recipient, 10, {from: spender}),
        truffleAssert.ErrorType.REVERT,
        'This should be a fail test case!'
      );
    });
  });

  describe('Test burn function', function() {
    beforeEach(initialize);
    
    it("burn success case", async () => {
      let burn_account = accounts[11];
      await tokenInstance.mint(burn_account, 10, {from: l2Gateway});
      let burn_tx = await tokenInstance.burn(burn_account, 5, {from: l2Gateway});
      await truffleAssert.eventEmitted(burn_tx, 'Burn', (ev) => {
        return ev.burnee === burn_account && ev.amount.toNumber() === 5 && ev.sender === l2Gateway;
      }, 'Burn event should be emitted with correct parameters');
      balance = await tokenInstance.balanceOf(burn_account);
      assert.strictEqual(balance.toNumber(), 5, "Balance of recipient not correct!");
    });

    it("burn should change the totalSupply", async () => {
      let burn_account = accounts[11];
      await tokenInstance.mint(burn_account, 10, {from: l2Gateway});
      let old_totalSupply = await tokenInstance.totalSupply();
      await tokenInstance.burn(burn_account, 5, {from: l2Gateway});
      let new_totalSupply = await tokenInstance.totalSupply();
      assert.strictEqual(old_totalSupply.toNumber() - 5, new_totalSupply.toNumber(), "totalSupply not change after burn!");
    });

    it("burn exceed the balance of account should fail", async () => {
      let burn_account = accounts[11];
      await tokenInstance.mint(burn_account, 10, {from: l2Gateway});
      await truffleAssert.reverts(
        tokenInstance.burn(burn_account, 11, {from: l2Gateway}),
        truffleAssert.ErrorType.REVERT,
        'This should be a fail test case!'
      );
    });

    it("burn exceed the balance of account should fail", async () => {
      let burn_account = accounts[11];
      await tokenInstance.mint(burn_account, 10, {from: l2Gateway});
      await tokenInstance.burn(burn_account, 9, {from: l2Gateway});
      await truffleAssert.reverts(
        tokenInstance.burn(burn_account, 2, {from: l2Gateway}),
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
      let initial_allowance = await tokenInstance.allowance(approver, spender);
      assert.strictEqual(initial_allowance.toNumber(), 0, "Initial allowance not correct!");
    });

    it("approve should change the allowance", async () => {
      let approver = accounts[11];
      let spender = accounts[12];
      let old_allowance = await tokenInstance.allowance(approver, spender);
      //await tokenInstance.mint(approver, 10, {from: l2Gateway});
      await tokenInstance.approve(spender, 9, {from: approver});
      let new_allowance = await tokenInstance.allowance(approver, spender);
      assert.strictEqual(old_allowance.toNumber() + 9, new_allowance.toNumber(), "Allowance after approve not correct!");
    });
  });


  describe('Test permit function', function() {
    beforeEach(initialize);

    let approver = accounts[11];
    let spender = accounts[12];
    let gaspender = accounts[13];

    it("can permit with signature", async () => {
      let nonce = await tokenInstance.nonces(approver);
      nonce = nonce.toString();
      const name = await tokenInstance.name();
      let chainid = await tokenInstance.deploymentChainId();;
      chainid = chainid.toString();
      const permitResult = await signERC2612Permit(
        web3.currentProvider,
        tokenInstance.address,
        approver,
        spender,
        '10',
        null,
        nonce,
        name,
        chainid,
        '1',
      );
      let old_allowance = await tokenInstance.allowance(approver, spender);
      await tokenInstance.permit(
        approver,
        spender,
        '10',
        permitResult.deadline,
        permitResult.v,
        permitResult.r,
        permitResult.s,
        {from: gaspender}
      );

      let new_allowance = await tokenInstance.allowance(approver, spender);
      assert.strictEqual(old_allowance.toNumber() + 10, new_allowance.toNumber(), "Allowance after approve not correct!");
    });

    it("permit expired", async () => {
      let nonce = await tokenInstance.nonces(approver);
      nonce = nonce.toString();
      const name = await tokenInstance.name();
      let chainid = await tokenInstance.deploymentChainId();;
      chainid = chainid.toString();
      const permitResult = await signERC2612Permit(
        web3.currentProvider,
        tokenInstance.address,
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
        tokenInstance.permit(
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
      let nonce = await tokenInstance.nonces(approver);
      nonce = nonce.toString();
      const name = await tokenInstance.name();
      let chainid = await tokenInstance.deploymentChainId();;
      chainid = chainid.toString();
      const permitResult = await signERC2612Permit(
        web3.currentProvider,
        tokenInstance.address,
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
        tokenInstance.permit(
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
      
      let up_tx = await tokenInstance.updateMetadata(newname,newsymbol, {from: rescuer});
      await truffleAssert.eventEmitted(up_tx, 'UpdateMetadata', (ev) => {
        return ev._newName === newname && ev._newSymbol === newsymbol;
      }, 'UpdateMetadata event should be emitted with correct parameters');

      const name = await tokenInstance.name();
      const symbol = await tokenInstance.symbol();
      assert.strictEqual(name, newname, "name not correct!");
      assert.strictEqual(symbol, newsymbol, "symbol not correct!");

      let nonce = await tokenInstance.nonces(approver);
      nonce = nonce.toString();

      let chainid = await tokenInstance.deploymentChainId();;
      chainid = chainid.toString();
      const permitResult = await signERC2612Permit(
        web3.currentProvider,
        tokenInstance.address,
        approver,
        spender,
        '10',
        null,
        nonce,
        name,
        chainid,
        '1',
      );
      let old_allowance = await tokenInstance.allowance(approver, spender);
      await tokenInstance.permit(
        approver,
        spender,
        '10',
        permitResult.deadline,
        permitResult.v,
        permitResult.r,
        permitResult.s,
        {from: gaspender}
      );

      let new_allowance = await tokenInstance.allowance(approver, spender);
      assert.strictEqual(old_allowance.toNumber() + 10, new_allowance.toNumber(), "Allowance after approve not correct!");
    });
  });
})