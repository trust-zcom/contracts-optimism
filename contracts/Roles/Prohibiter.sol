pragma solidity ^0.5.8;

import "./Pauser.sol";

contract Prohibiter is Pauser {
    address internal prohibiter = address(0);
    mapping(address => bool) public isProhibited;

    event Prohibition(address prohibited, bool status, address sender);

    modifier onlyProhibiter() {
        require(msg.sender == prohibiter, "the sender is not the prohibiter");
        _;
    }

    modifier onlyNotProhibited(address _account) {
        require(!isProhibited[_account], "this account is a prohibited");
        _;
    }

    modifier onlyProhibited(address _account) {
        require(isProhibited[_account], "this account is not a prohibited");
        _;
    }

    function prohibit(address _account) public onlyProhibiter whenNotPaused isNotZeroAddress(_account) onlyNotProhibited(_account) {
        isProhibited[_account] = true;
        emit Prohibition(_account, isProhibited[_account], msg.sender);
    }

    function unprohibit(address _account) public onlyProhibiter whenNotPaused isNotZeroAddress(_account) onlyProhibited(_account) {
        isProhibited[_account] = false;
        emit Prohibition(_account, isProhibited[_account], msg.sender);
    }
}