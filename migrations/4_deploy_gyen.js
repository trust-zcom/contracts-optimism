const config = require('config');
const Web3EthAbi = require('web3-eth-abi');
const GYEN = artifacts.require('GYEN');
const Token = artifacts.require('Token_v1');

const [initializeAbi] = Token.abi.filter((f) => f.name === 'initialize');

const name = config.get('production') ? 'GMO JPY' : `GMO JPY${config.get('name_suffix')}`;
const symbol = config.get('production') ? 'GYEN' : `GYEN${config.get('symbol_suffix')}`;;
const decimals = 6;
const owner = config.get('owner');
const admin = config.get('admin');
const capper = config.get('capper');
const prohibiter = config.get('prohibiter');;
const pauser = config.get('pauser');
const minterAdmin = config.get('minterAdmin');;
const minter = config.get('minter');;

module.exports = function(deployer){
    deployer
        .then(() => Token.deployed())
        .then(token => deployer.deploy(GYEN, token.address, config.get('deployer'), Web3EthAbi.encodeFunctionCall(initializeAbi, [name, symbol, decimals, owner, admin, capper, prohibiter, pauser, minterAdmin, minter])));
};