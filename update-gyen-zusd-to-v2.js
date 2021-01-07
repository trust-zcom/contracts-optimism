const Web3EthAbi = require('web3-eth-abi');
const ZUSD = artifacts.require('ZUSD');
const GYEN = artifacts.require('GYEN');
const Token = artifacts.require('Token_v2');

async function upgrade() {

  const newtworkType = await web3.eth.net.getNetworkType();
  console.log('newtworkType:', newtworkType);
  const networkId = await web3.eth.net.getId();
  console.log('networkId:', networkId);

  const [initializeWiperAbi] = Token.abi.filter((f) => f.name === 'initializeWiper');
  
  const config = require(`./config/${newtworkType}.json`);
  const deployeraddress = config.deployer;
  const wiper = config.wiper; 
  console.log('deployer: ', deployeraddress);
  console.log('wiper: ', wiper);

  const token = await Token.deployed();
  const tokenV2address = token.address; 
  console.log('Token_v2 address: ', tokenV2address);
  
  const zusd = await ZUSD.deployed();
  console.log('ZUSD: ', zusd.address);
  
  console.log('\nZUSD-upgradeToAndCall ... ...'); 
  let receipt = await zusd.upgradeToAndCall(tokenV2address, Web3EthAbi.encodeFunctionCall(initializeWiperAbi,[wiper]));
  //console.log(receipt);
  console.log(`https://${newtworkType}.etherscan.io/tx/${receipt.tx}`);

  console.log('\nZUSD-changeAdmin ... ...'); 
  receipt = await zusd.changeAdmin(deployeraddress);
  console.log(`https://${newtworkType}.etherscan.io/tx/${receipt.tx}`);

  console.log('Upgrade ZUSD successfully end.\n');

  const gyen = await GYEN.deployed();
  console.log('GYEN: ', gyen.address);
  console.log('\nGYEN-upgradeToAndCall ... ...'); 
  receipt = await gyen.upgradeToAndCall(tokenV2address, Web3EthAbi.encodeFunctionCall(initializeWiperAbi,[wiper]));
  console.log(`https://${newtworkType}.etherscan.io/tx/${receipt.tx}`);

  console.log('\nGYEN-changeAdmin ... ...'); 
  receipt = await gyen.changeAdmin(deployeraddress);
  console.log(`https://${newtworkType}.etherscan.io/tx/${receipt.tx}`);

  console.log('Upgrade GYEN successfully end.\n')
}

module.exports = async (callback) => {
  try {
    await upgrade();
  } catch (e) {
    console.log(e);
  }
  callback();
};