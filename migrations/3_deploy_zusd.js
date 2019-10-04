const Web3EthAbi = require('web3-eth-abi');
const ZUSD = artifacts.require('ZUSD');
const Token = artifacts.require('Token_v1');

const [initializeAbi] = Token.abi.filter((f) => f.name === 'initialize');

const name = 'Z.com USD';
const symbol = 'ZUSD';
const decimals = 6;
const owner = '0x31b2e0aea80e2fddf5ed255da28fbcff4aa2523f';
const admin = '0x7125c5a8d5f2c42df64ba8aa32c2f257f53f7d22';
const capper = '0x3Ab64CA9683B22898A521A1Dbae9E1CD10633c09';
const prohibiter = '0x80f41a3ed17ec04d7d8e9a90b95d9566b40089b8';
const pauser = '0x845ea010b507dcc36693a4937a86de5162795a09';
const minterAdmin = '0x9fee7470dceae3d31c6f0944d3b1ba93a140ced0';
const minter = '0x77dff69a1745064f5af19850233b6cb29ed807d5';

module.exports = function(deployer) {
    deployer
        .then(() => Token.deployed())
        .then(token => deployer.deploy(ZUSD, token.address, '0xe418ce09763d13692516fab7160324b01e04b223', Web3EthAbi.encodeFunctionCall(initializeAbi, [name, symbol, decimals, owner, admin, capper, prohibiter, pauser, minterAdmin, minter])));
};