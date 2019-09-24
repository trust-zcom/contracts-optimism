const Web3EthAbi = require('web3-eth-abi');
const GYEN = artifacts.require('GYEN');
const Token = artifacts.require('Token_v1');

const [initializeAbi] = Token.abi.filter((f) => f.name === 'initialize');

const name = 'GMO JPY';
const symbol = 'GYEN';
const decimals = 6;
const owner = '0x26ddd672471d879c3da4793d170c2b56a7a4d22f';
const admin = '0xd41edc5e5dfcf88b00b922668e65f0e66bc61d06';
const capper = '0x0542a23275cf69680d2339c14874511f362ee600';
const prohibiter = '0x80f41a3ed17ec04d7d8e9a90b95d9566b40089b8';
const pauser = '0x845ea010b507dcc36693a4937a86de5162795a09';
const minterAdmin = '0xbb535952d08aec6ae4e17e87037edaf8bdcad2e8';
const minter = '0x77dff69a1745064f5af19850233b6cb29ed807d5';

module.exports = function(deployer){
    deployer
        .then(() => Token.deployed())
        .then(token => deployer.deploy(GYEN, token.address, '0x5fdf46ac8f52b24c17edb918719715ea883e6604', Web3EthAbi.encodeFunctionCall(initializeAbi, [name, symbol, decimals, owner, admin, capper, prohibiter, pauser, minterAdmin, minter])));
};