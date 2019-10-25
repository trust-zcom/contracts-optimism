# ZUSD/GYEN
Z.com trust company(要確認) issued two stablecoins. The one is Z.com USD (ZUSD) and the other is GMO JPY (GYEN). ZUSD is collateralized by USD and GYEN is by JPY.

## Contracts
ZUSD and GYEN are upgradable ERC20 tokens with some safety features.

### ERC20
The implementation of the ERC20 interface is based on OpenZeppelin, therefore, we do not describe it.

### Supply token
`minter` can mint the same token as the cash we received. On the other hand, to send cash, we must burn the same token as the cash we want to send.

### Capacity
`capacity` is one of the safety features and is the maximum value of `totalSupply`. `minter` cannot mint more token than `capacity`. By keeping `capacity` `totalSupply`, `capper` must change `capacity` whenever `minter` mints tokens. Also, `minter` and `capper` should be different accounts and their private keys should have been managed by different physical devices. Therefore, tokens can be mintted safety.

### Prohibit
`prohibit` is the feature for AML. `prohibiter` can prohibits ML users from transferring tokens.

### Pause
`pause` is a used feature in an emergency. When `pauser` pauses the token, all transactions of the token will fail.

### Account management
All accounts must be changeable for security, however, one account must not be able to change all accounts. Therefore, `admin` can change `capper`, `prohibiter` and `pauser`, and `minterAdmin` can change `minter`. Since `admin` and `minterAdmin` must also be changeable, `owner`, which is kept very strictly, can change `admin` and `minterAdmin`.

### Upgrade contracts
ZUSD.sol and GYEN.sol are proxy contracts and Token_v1.sol is a implementation contract. The implementation of proxy contracts is based on OpenZeppelin, therefore, we do not describe it.