pragma solidity ^0.5.8;

import "./Pauser.sol";

contract Capper is Pauser {
    uint256 public capacity = 0;
    address internal capper = address(0);

    event Cap(uint256 indexed newCapacity, address indexed sender);

    modifier onlyCapper() {
        require(msg.sender == capper, "the sender is not the capper");
        _;
    }

    modifier notMoreThanCapacity(uint256 _amount) {
        require(_amount <= capacity, "this amount is more than capacity");
        _;
    }

    function _cap(uint256 _amount) internal {
        capacity = _amount;
        emit Cap(capacity, msg.sender);
    }
}