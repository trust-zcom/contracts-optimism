const Web3EthAbi = require('web3-eth-abi');
const GYEN = artifacts.require('GYEN');
const Token = artifacts.require('OpToken_v1');

const [initializeAbi] = Token.abi.filter((f) => f.name === 'initialize');

module.exports = function(deployer, network){
    if (network != "test" && network != "coverage") {
        const config = require(`../config/${deployer.network}.json`);

        const name_tmp = config.name_gyen;
        const symbol_tmp = config.symbol_gyen;
        const name = config.production ? name_tmp : `${name_tmp}${config.name_suffix}`;
        const symbol = config.production ? symbol_tmp : `${symbol_tmp}${config.symbol_suffix}`;
        const decimals = 6;
        const { owner, admin, prohibiter, pauser, wiper, rescuer,l1Address_gyen, l2Gateway } = config;
    
        deployer
            .then(() => Token.deployed())
            .then(token => deployer.deploy(GYEN, token.address, config.deployer, Web3EthAbi.encodeFunctionCall(initializeAbi, [name, symbol, decimals, owner, admin, prohibiter, pauser, wiper, rescuer, l1Address_gyen, l2Gateway])));
    }
};