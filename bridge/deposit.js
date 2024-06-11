//node --version
//v18.13.0

// ERC-20 transfers between L1 and L2 using the Optimism SDK
const ethers = require("ethers")
const optimismSDK = require("@eth-optimism/sdk")
require('dotenv').config()


const privateKey = process.env.PRIVATE_KEY
const l1Url = process.env.SEPOLIA_URL
const l2Url = process.env.SEPOLIA_OPTIMISIM_URL

const erc20Addrs = {
  l1Addr: process.env.SEPOLIA_TOKEN_ADDRESS,
  l2Addr: process.env.SEPOLIA_OPTIMISIM_TOKEN_ADDRESS,
}

// Global variable because we need them almost everywhere
let crossChainMessenger
let l1ERC20, l2ERC20    // OUTb contracts to show ERC-20 transfers
let ourAddr             // The address of the signer we use.  


// Get signers on L1 and L2 (for the same address). Note that 
// this address needs to have ETH on it, both on Optimism and
// Optimism Georli
const getSigners = async () => {
    const l1RpcProvider = new ethers.providers.JsonRpcProvider(l1Url)
    const l2RpcProvider = new ethers.providers.JsonRpcProvider(l2Url)
    //const hdNode = ethers.utils.HDNode.fromMnemonic(mnemonic)
    //const privateKey = hdNode.derivePath(ethers.utils.defaultPath).privateKey
    const l1Wallet = new ethers.Wallet(privateKey, l1RpcProvider)
    const l2Wallet = new ethers.Wallet(privateKey, l2RpcProvider)

    return [l1Wallet, l2Wallet]
}   // getSigners



// The ABI fragment for the contract. We only need to know how to do two things:
// 1. Get an account's balance
// 2. Call the faucet to get more (only works on L1). Of course, production 
//    ERC-20 tokens tend to be a bit harder to acquire.
const erc20ABI = [
  {
    "constant": true,
    "inputs": [
      {
        "name": "account",
        "type": "address"
      }
    ],
    "name": "balanceOf",
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  }
]    // erc20ABI



const setup = async() => {
  const [l1Signer, l2Signer] = await getSigners()
  ourAddr = l1Signer.address
  crossChainMessenger = new optimismSDK.CrossChainMessenger({
      l1ChainId: 11155111,    // Sepolia
      l2ChainId: 11155420,  // Optimism Sepolia
      l1SignerOrProvider: l1Signer,
      l2SignerOrProvider: l2Signer
  })
  l1ERC20 = new ethers.Contract(erc20Addrs.l1Addr, erc20ABI, l1Signer)
  l2ERC20 = new ethers.Contract(erc20Addrs.l2Addr, erc20ABI, l2Signer)
}    // setup

const reportERC20Balances = async () => {
  const l1Balance = (await l1ERC20.balanceOf(ourAddr)).toString().slice(0,-6)
  const l2Balance = (await l2ERC20.balanceOf(ourAddr)).toString().slice(0,-6)
  console.log(`Token Balance on L1(sepolia):  ${l1Balance}`)
  console.log(`Token Balance on L2(optimism): ${l2Balance}`)
  console.log('\n')
}    // reportERC20Balances


const transferToken = BigInt(process.argv[2])

const depositERC20 = async () => {

  console.log("Deposit ERC20 from L1 to L2 start ...\n\n")
  // log public address
  console.log(`Public address: ${ourAddr}\n`)
  await reportERC20Balances()
  const start = new Date()

  // Need the l2 address to know which bridge is responsible
  const allowanceResponse = await crossChainMessenger.approveERC20(
    erc20Addrs.l1Addr, erc20Addrs.l2Addr, transferToken)
  await allowanceResponse.wait()
  console.log(`Allowance given by tx ${allowanceResponse.hash}`)
  console.log(`\tMore info: https://sepolia.etherscan.io/tx/${allowanceResponse.hash}`)
  console.log(`Time so far ${(new Date()-start)/1000} seconds`)


  const response = await crossChainMessenger.depositERC20(
    erc20Addrs.l1Addr, erc20Addrs.l2Addr, transferToken)
  console.log(`\n\nDeposit transaction hash (on L1): ${response.hash}`)
  console.log(`\tMore info: https://sepolia.etherscan.io/tx/${response.hash}`)
  await response.wait()
  console.log("Waiting for status to change to RELAYED")
  console.log(`Time so far ${(new Date()-start)/1000} seconds\n\n`)
  
  await crossChainMessenger.waitForMessageStatus(response.hash,
                                                  optimismSDK.MessageStatus.RELAYED)

  await reportERC20Balances()
  console.log(`depositERC20 took ${(new Date()-start)/1000} seconds\n\n`)
  console.log(`Please check your optimism token balance on \n 
  https://sepolia-optimism.etherscan.io/address/${ourAddr}#tokentxns\n`)
}     // depositERC20()

const main = async () => {
    await setup()
    await depositERC20()
}  // main

main().then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })





