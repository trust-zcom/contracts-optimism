const Web3EthAbi = require('web3-eth-abi');
const ZUSD = artifacts.require('ZUSD');
const GYEN = artifacts.require('GYEN');
const Token = artifacts.require('Token_v2');


module.exports = async (deployer, network) => {

    if (network != "test" && network != "coverage") {

        const [initializeWiperAbi] = Token.abi.filter((f) => f.name === 'initializeWiper');
  
        const config = require(`../config/${deployer.network}.json`);
        const deployeraddress = config.deployer;
        const wiper = config.wiper; 
        console.log('\ndeployer: ', deployeraddress);
        console.log('wiper: ', wiper);
      
        const token = await Token.deployed();
        const tokenV2address = token.address; 
        console.log('Token_v2 Address: ', tokenV2address);
        
        const zusd = await ZUSD.deployed();
        console.log('\nZUSD Address: ', zusd.address);
        
        console.log('\nZUSD-upgradeToAndCall ... ...'); 
        let receipt = await zusd.upgradeToAndCall(tokenV2address, Web3EthAbi.encodeFunctionCall(initializeWiperAbi,[wiper]));
        //console.log(receipt);
        console.log(`https://${network}.etherscan.io/tx/${receipt.tx}`);
      
        console.log('\nZUSD-changeAdmin ... ...'); 
        receipt = await zusd.changeAdmin(deployeraddress);
        console.log(`https://${network}.etherscan.io/tx/${receipt.tx}`);
      
        console.log('Upgrade ZUSD to V2 successfully end.\n');
      
        const gyen = await GYEN.deployed();
        console.log('GYEN Address: ', gyen.address);
        console.log('\nGYEN-upgradeToAndCall ... ...'); 
        receipt = await gyen.upgradeToAndCall(tokenV2address, Web3EthAbi.encodeFunctionCall(initializeWiperAbi,[wiper]));
        console.log(`https://${network}.etherscan.io/tx/${receipt.tx}`);
      
        console.log('\nGYEN-changeAdmin ... ...'); 
        receipt = await gyen.changeAdmin(deployeraddress);
        console.log(`https://${network}.etherscan.io/tx/${receipt.tx}`);
      
        console.log('Upgrade GYEN to V2 successfully end.\n');

    }
}