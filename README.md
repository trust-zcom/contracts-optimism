# For develop
## Run ganache-cli server
1. ganache-cli command
- run with -d for persist the accounts
  + `./node_modules/.bin/ganache-cli -p 7545 -d -a 15 -i 5777`
  + `./node_modules/.bin/truffle console`
1. run with lock account (for test sign transaction)
 - For example we need to unlock first two accounts and lock other accounts:
   + `./node_modules/.bin/ganache-cli -p 7545 -d --secure -u 0 -u 1`

## Migrate specific file:
   + `migrate -f 3 --to 3`


# Run Test 
## Command
- test all file
  + `./node_modules/.bin/truffle test`
- test specific file
  + `./node_modules/.bin/truffle test ./test/token.js`


# Note
- 今truffleは特定なテストを実行できないです。
  (https://github.com/trufflesuite/truffle/issues/2080)

