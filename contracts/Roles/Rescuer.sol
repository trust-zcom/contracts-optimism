pragma solidity 0.5.13;

import "./Pauser.sol";
import { IERC20 } from "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";
import { SafeERC20 } from "openzeppelin-solidity/contracts/token/ERC20/SafeERC20.sol";

contract Rescuer is Pauser  {
    using SafeERC20 for IERC20;
    address public rescuer = address(0);
    event Rescue(IERC20 indexed tokenAddr, address indexed toAddr, uint256 amount);

    modifier onlyRescuer() {
        require(msg.sender == rescuer, "the sender is not the rescuer");
        _;
    }

    function rescue(IERC20 _tokenContract, address _to, uint256 _amount) public whenNotPaused onlyRescuer {
        _tokenContract.safeTransfer(_to, _amount);
        emit Rescue(_tokenContract, _to, _amount);
    }
}