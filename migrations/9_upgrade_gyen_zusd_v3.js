const Web3EthAbi = require('web3-eth-abi');
const ZUSD = artifacts.require('ZUSD');
const GYEN = artifacts.require('GYEN');
const Token = artifacts.require('Token_v3');


module.exports = async (deployer, network) => {

    if (network != "test" && network != "coverage") {
        //const newName = 'modified name ';
        const [initializeV3Abi] = Token.abi.filter((f) => f.name === 'initializeRescuer');

        const config = require(`../config/${deployer.network}.json`);
        const deployeraddress = config.deployer;
        const rescuer = config.rescuer;
        console.log('\ndeployer: ', deployeraddress);
        console.log('rescuer: ', rescuer);

        const token = await Token.deployed();
        const tokenV3address = token.address;
        console.log('Token_v3 Address: ', tokenV3address);

        const zusd = await ZUSD.deployed();
        console.log('\nZUSD Address: ', zusd.address);

        console.log('\nZUSD-upgradeToAndCall ... ...');
        let receipt = await zusd.upgradeToAndCall(tokenV3address, Web3EthAbi.encodeFunctionCall(initializeV3Abi,[rescuer]));
        if(network == "production"){
            console.log(`https://etherscan.io/tx/${receipt.tx}`);
        } else{
            console.log(`https://${network}.etherscan.io/tx/${receipt.tx}`);
        }

        console.log('\nZUSD change deployer ... ...');
        receipt = await zusd.changeAdmin(deployeraddress);
        if(network == "production"){
            console.log(`https://etherscan.io/tx/${receipt.tx}`);
        } else{
            console.log(`https://${network}.etherscan.io/tx/${receipt.tx}`);
        }

        console.log('Upgrade ZUSD to V3 successfully end.\n');

        const gyen = await GYEN.deployed();
        console.log('GYEN Address: ', gyen.address);
        console.log('\nGYEN-upgradeToAndCall ... ...');
        receipt = await gyen.upgradeToAndCall(tokenV3address, Web3EthAbi.encodeFunctionCall(initializeV3Abi,[rescuer]));
        if(network == "production"){
            console.log(`https://etherscan.io/tx/${receipt.tx}`);
        } else{
            console.log(`https://${network}.etherscan.io/tx/${receipt.tx}`);
        }

        console.log('\nGYEN change deployer ... ...');
        receipt = await gyen.changeAdmin(deployeraddress);
        if(network == "production"){
            console.log(`https://etherscan.io/tx/${receipt.tx}`);
        } else{
            console.log(`https://${network}.etherscan.io/tx/${receipt.tx}`);
        }

        console.log('Upgrade GYEN to V3 successfully end.\n');

    }
}