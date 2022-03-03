pragma solidity 0.5.8;

import "./Token_v2.sol";
import "./Roles/Rescuer.sol";
import { IERC20 } from "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";
import { SafeERC20 } from "openzeppelin-solidity/contracts/token/ERC20/SafeERC20.sol";

contract Token_v3 is Token_v2, Rescuer {
    using SafeERC20 for IERC20;
    event Rescue(IERC20 indexed tokenAddr, address indexed toAddr, uint256 amount);
    event RescuerChanged(address indexed oldRescuer, address indexed newRescuer, address indexed sender);

    // only admin can change rescuer
    function changeRescuer(address _account) public onlyAdmin whenNotPaused isNotZeroAddress(_account) {
        address old = rescuer;
        rescuer = _account;
        emit RescuerChanged(old, rescuer, msg.sender);
    }

    // rescue locked ERC20 Tokens
    function rescue(IERC20 _tokenContract, address _to, uint256 _amount) public whenNotPaused onlyRescuer {
        _tokenContract.safeTransfer(_to, _amount);
        emit Rescue(_tokenContract, _to, _amount);
    }
}