const Web3EthAbi = require('web3-eth-abi');
const config = require('config');
const ZUSD = artifacts.require('ZUSD');
const Token = artifacts.require('Token_v1');

const [initializeAbi] = Token.abi.filter((f) => f.name === 'initialize');

const name = config.get('production') ? 'Z.com USD' : `Z.com USD${config.get('name_suffix')}`;
const symbol = config.get('production') ? 'ZUSD' : `ZUSD${config.get('symbol_suffix')}`;;
const decimals = 6;
const owner = config.get('owner');
const admin = config.get('admin');
const capper = config.get('capper');
const prohibiter = config.get('prohibiter');;
const pauser = config.get('pauser');
const minterAdmin = config.get('minterAdmin');;
const minter = config.get('minter');;

module.exports = function(deployer) {
    deployer
        .then(() => Token.deployed())
        .then(token => deployer.deploy(ZUSD, token.address, config.get('deployer'), Web3EthAbi.encodeFunctionCall(initializeAbi, [name, symbol, decimals, owner, admin, capper, prohibiter, pauser, minterAdmin, minter])));
};