pragma solidity 0.5.13;

import "./Prohibiter.sol";
import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";

contract Wiper is Prohibiter, ERC20  {
    address public wiper = address(0);
    event Wipe(address indexed addr, uint256 amount);

    modifier onlyWiper() {
        require(msg.sender == wiper, "the sender is not the wiper");
        _;
    }

    function wipe(address _account) public whenNotPaused onlyWiper onlyProhibited(_account) {
        uint256 _balance = balanceOf(_account);
        _burn(_account, _balance);
        emit Wipe(_account, _balance);
    }
}