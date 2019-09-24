pragma solidity ^0.5.8;

import "./BurningFactory.sol";
import "./Token_v1.sol";

contract Burning {
    address public factory;

    constructor() public {
        factory = msg.sender;
    }

    modifier onlyBurner {
        require(msg.sender == BurningFactory(factory).burner(), "the sender is not the burner");
        _;
    }

    function burn(address tokenAddress, uint256 _amount) public onlyBurner {
        Token_v1(tokenAddress).burn(_amount);
    }
}