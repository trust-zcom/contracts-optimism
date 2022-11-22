pragma solidity 0.5.16;

import "./Wiper.sol";
import "./Rescuer.sol";

contract Admin is Rescuer, Wiper {
    address public admin = address(0);

    event PauserChanged(address indexed oldPauser, address indexed newPauser, address indexed sender);
    event ProhibiterChanged(address indexed oldProhibiter, address indexed newProhibiter, address indexed sender);
    event WiperChanged(address indexed oldWiper, address indexed newWiper, address indexed sender);
    event RescuerChanged(address indexed oldRescuer, address indexed newRescuer, address indexed sender);

    modifier onlyAdmin() {
        require(msg.sender == admin, "the sender is not the admin");
        _;
    }

    /**
     * Change Pauser
     * @dev "whenNotPaused" modifier should not be used here
     */
    function changePauser(address _account) public onlyAdmin isNotZeroAddress(_account) {
        address old = pauser;
        pauser = _account;
        emit PauserChanged(old, pauser, msg.sender);
    }

    function changeProhibiter(address _account) public onlyAdmin whenNotPaused isNotZeroAddress(_account) {
        address old = prohibiter;
        prohibiter = _account;
        emit ProhibiterChanged(old, prohibiter, msg.sender);
    }

    function changeWiper(address _account) public onlyAdmin whenNotPaused isNotZeroAddress(_account) {
        address old = wiper;
        wiper = _account;
        emit WiperChanged(old, wiper, msg.sender);
    }

    function changeRescuer(address _account) public onlyAdmin whenNotPaused isNotZeroAddress(_account) {
        address old = rescuer;
        rescuer = _account;
        emit RescuerChanged(old, rescuer, msg.sender);
    }
}