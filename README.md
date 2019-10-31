# ZUSD/GYEN
GMO-Z.com Trust Company issued two stablecoins. One is Z.com USD (ZUSD) and the other is GMO JPY (GYEN). ZUSD is collateralized by U.S. Dollar and GYEN is collateralized by Japanese Yen.

## Contracts
ZUSD and GYEN are upgradable ERC20 tokens with features that ensure the tokens' security in minting, anti-money laundering, and emergency precautions.

### ERC20
The implementation of the ERC20 interface is based on OpenZeppelin. Therefore, we do not elaborate the technical details in this document.

### Supply token
There is no 1: 1 constraint with fiat in terms of contract functionality, but we conduct 1: 1 constraint on Mint & Burn during our operation and we will not issue tokens surpass fiat fund that we received. 
Therefore, `minter` will only mint the same amount of token 1:1 to the fiat fund we received. On the other hand, to send fiat fund, we will burn the same amount of token 1:1 to the fiat fund we want to send.


### Capacity
`capacity` is one of the safety features and it is the maximum value of `totalSupply`. `minter` cannot mint more token than `capacity`. By keeping `capacity` and `totalSupply` equal in amount, `capper` must change `capacity` before `minter` is able to mint tokens. `minter` could not mint tokens if `capper` does not change `capacity` in advance. Also, `minter` and `capper` should be different and separate accounts. The private keys for `minter` and `capper` should be managed by different physical devices. Therefore, tokens can be minted securely without malicious use.

### Prohibit
`prohibit` is the feature for Anti-Money Laundering (AML). `prohibiter` can prohibits users with money laundering actions from transferring tokens.

### Pause
`pause` is the feature for emergency situations. When `pauser` pauses the token, all transactions of the token will fail.

### Account management
All keys such as minter and capper must be changeable. In case of the incidents that a key is leaked or used maliciously, we could change the key not only as a countermeasure in the event of a key leakage are necessary, but also as a measure to mitigate the risk. Therefore, all accounts must be changeable for above security reasons and follow the rules as follows. `admin` can change `capper`, `prohibiter` and `pauser`; `minterAdmin` can change `minter`. Since `admin` and `minterAdmin` must be changeable as well, `owner`, which is kept very strictly, can change `admin` and `minterAdmin`.

### Upgrade contracts
ZUSD.sol and GYEN.sol are proxy contracts and Token_v1.sol is an implementation contract. The implementation of proxy contracts is based on OpenZeppelin. Therefore, we do not elaborate the technical details for it.
