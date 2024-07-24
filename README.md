# GMO-Z.com Trust Company, Inc. Fiat Tokens

The GMO Trust token is an ERC-20 compatible smart contract. It allows minting, burning, pausing (of activity), freezing (of an individual address), and upgrading the contract with new features or to fix bugs.

The smart contract is used to issue two stablecoins — GYEN is backed 1:1 by JPY and ZUSD is backed 1:1 by USD. You can learn more about fiat reserves, minting of new tokens, etc. in our [FAQ](https://stablecoin.z.com/).

## Stablecoin

There is no 1:1 constraint with fiat currencies in terms of the contract functionality, but we conduct 1:1 constraint on Mint & Burn during our operation. Customers can send the fiat currency fund to our partner bank account via ZUSD/GYEN purchase requests, maintained by GMO Trust.

We mint the same amount of tokens 1:1 with fiat currency fund customers sent, which will then be transferred to the wallet addresses customers provided. Since customers can send arbitrary fiat currency funds, arbitrary minting is necessary.

When we burn tokens upon customers' redemption requests, we send the same amount of fiat currency fund 1:1 with the burned token amount to customers' bank accounts. 

Customers can burn tokens by calling `burn()` themselves, however, they will not receive the underlying fiat currencies in such case.

For using GYEN/ZUSD in Optimism, users can bridge their GYEN/ZUSD through [Optimism Bridge](https://app.optimism.io/bridge/deposit).
Below is about GYEN/ZUSD on Optimism.

## Roles

Each role (address) is used to control specific feature(s):

- `owner` - performs `admin` assignments, and reassigns itself.
- `admin` - assigns `prohibiter`, `pauser`, `rescuer`, and `wiper` roles.
- `prohibiter` - can prohibit users (addresses) from transferring tokens in accordance with Anti-Money Laundering (AML) procedures.
- `pauser` - can pause and unpause transfers (and other actions) for the entire contract.
- `rescuer` - can rescue tokens locked in GYEN/ZUSD smart contract address.
- `wiper` - can wipe out the balance of an address upon instructions from law enforcement agencies.

## ERC-20

The implementation of the contract interface is based on the OpenZeppelin framework.

The standard ERC-20 `approve()` and `transferFrom()` might cause a race condition which could result in a loss of funds for users that employ these two functions. Therefore, we recommend using `increaseAllowance()` and `decreaseAllowance()` instead of `approve()`.

## Minting and Burning

GYEN/ZUSD is native to Ethereum. It can be bridged to Optimism.
When move tokens from Ethereum to Optimism, callable path is L1Gateway depositToken (which handles L1 escrow), which triggers L2Gateway, `mint` will be called.

When move tokens from Optimism to Ethereum, `burn` will be called. Only the token bridge can call this.

## Prohibit

`prohibit` is a security feature implemented for the purpose of Anti-Money Laundering (AML) activities. `prohibiter` can prevent specific end users (addresses) from performing token transactions.

## Pause

`pause` is a security feature intended for use in emergencies. While the `pauser` pauses the token, all transactions (except `changeAdmin()`, the reassignment of `admin` and `changePauser`, reassignment of `pauser`) are stopped and will fail.

## Wipe

`wipe` is another security feature. `wiper` can wipe out the balance of an address upon instructions from law enforcement agencies. In such cases, the underlying fiat currency will be handled according to law enforcement’s instructions.

## Rescue

`rescue` is for rescuing tokens locked in GYEN/ZUSD smart contract address.

## Permit

`permit` is for gasless approval of tokens (standardized as ERC2612).

So, both GYEN and ZUSD are EIP-2612-compliant token on Optimism.

## Upgrading

ZUSD.sol and GYEN.sol are proxy contracts and OpToken_v1.sol is an implementation contract. The proxy contracts are based on the OpenZeppelin framework.

When an upgrade is needed, a new implementation contact (OpToken_v2.sol, OpToken_v3.sol, etc.) can be deployed and the proxy is updated to point to it.