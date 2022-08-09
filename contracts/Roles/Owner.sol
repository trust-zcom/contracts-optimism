pragma solidity 0.5.13;

import "./Admin.sol";

contract Owner is Admin {
    address public owner = address(0);

    event OwnerChanged(address indexed oldOwner, address indexed newOwner, address indexed sender);
    event AdminChanged(address indexed oldAdmin, address indexed newAdmin, address indexed sender);

    modifier onlyOwner() {
        require(msg.sender == owner, "the sender is not the owner");
        _;
    }

    function changeOwner(address _account) public onlyOwner whenNotPaused isNotZeroAddress(_account) {
        address old = owner;
        owner = _account;
        emit OwnerChanged(old, owner, msg.sender);
    }

    /**
     * Change Admin
     * @dev "whenNotPaused" modifier should not be used here
     */
    function changeAdmin(address _account) public onlyOwner isNotZeroAddress(_account) {
        address old = admin;
        admin = _account;
        emit AdminChanged(old, admin, msg.sender);
    }
}