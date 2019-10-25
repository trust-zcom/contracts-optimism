const Web3EthAbi = require('web3-eth-abi');
const GYEN = artifacts.require('GYEN');
const Token = artifacts.require('Token_v1');

const [initializeAbi] = Token.abi.filter((f) => f.name === 'initialize');

module.exports = function(deployer){
    const config = require(`../config/${deployer.network}.json`);

    const name = config.production ? 'GMO JPY' : `GMO JPY${config.name_suffix}`;
    const symbol = config.production ? 'GYEN' : `GYEN${config.symbol_suffix}`;
    const decimals = 6;
    const owner = config.owner;
    const admin = config.admin;
    const capper = config.capper;
    const prohibiter = config.prohibiter;
    const pauser = config.pauser;
    const minterAdmin = config.minterAdmin;
    const minter = config.minter;

    deployer
        .then(() => Token.deployed())
        .then(token => deployer.deploy(GYEN, token.address, config.deployer, Web3EthAbi.encodeFunctionCall(initializeAbi, [name, symbol, decimals, owner, admin, capper, prohibiter, pauser, minterAdmin, minter])));
};