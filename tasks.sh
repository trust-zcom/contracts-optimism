#!/bin/sh
#If permission denied, please use chmod +x tasks.sh
# use case: ./tasks.sh {network} {action}
# for network
#   production -> production environment
#   ropsten -> ropsten environment
# for action
#   1 -> deploy arbitrum v1
#   2 -> get permit signature
#      ./tasks.sh <network> 2 <owner_private_key> <spender> <value> <deadline>

case $2 in
    1)
        npx truffle migrate --network $1
        ;;

    2)
        npx truffle exec ./ERC2612PermitSignature.js $3 $4 $5 $6 --network $1
        ;;

    *)
        echo "./tasks.sh $1 {action}"
        echo "  action parameter error. Only 1, 2 are permitted now."
esac