pragma solidity ^0.5.8;

import "./Common.sol";

contract Pauser is Common {
    address internal pauser = address(0);
    bool private _paused = false;

    event Pause(bool status, address sender);

    modifier onlyPauser() {
        require(msg.sender == pauser, "the sender is not the pauser");
        _;
    }

    modifier whenNotPaused() {
        require(!_paused, "this is a paused contract");
        _;
    }

    modifier whenPaused() {
        require(_paused, "this is not a paused contract");
        _;
    }

    function pause() public onlyPauser whenNotPaused {
        _paused = true;
        emit Pause(_paused, msg.sender);
    }

    function unpause() public onlyPauser whenPaused {
        _paused = false;
        emit Pause(_paused, msg.sender);
    }
}