pragma solidity 0.5.16;

import "@openzeppelin/upgrades/contracts/Initializable.sol";
import "./Roles/Owner.sol";

contract OpToken_v1 is Initializable, Owner {

    string public name;
    string public symbol;
    uint8 public decimals;
    address public l1Token;
    address public l2Bridge;
    bytes32 private _DOMAIN_SEPARATOR;
    uint256 public deploymentChainId;
    mapping (address => uint256) public nonces;

    string public constant version  = "1";
    bytes32 public constant PERMIT_TYPEHASH = keccak256("Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)");

    event Mint(address indexed _account, uint256 _amount);
    event Burn(address indexed _account, uint256 _amount);

    modifier onlyL2Bridge() {
        require(msg.sender == l2Bridge, "Only L2 Bridge can mint and burn");
        _;
    }

    function initialize(
        string memory _name,
        string memory _symbol,
        uint8 _decimals,
        address _owner,
        address _admin,
        address _prohibiter,
        address _pauser,
        address _wiper,
        address _rescuer,
        address _l1Token,
        address _l2Bridge
        ) public initializer {
            require(_owner != address(0), "_owner is the zero address");
            require(_admin != address(0), "_admin is the zero address");
            require(_prohibiter != address(0), "_prohibiter is the zero address");
            require(_pauser != address(0), "_pauser is the zero address");
            require(_wiper != address(0), "_wiper is the zero address");
            require(_rescuer != address(0), "_rescuer is the zero address");
            require(_l1Token != address(0), "_l1Token is the zero address");
            require(_l2Bridge != address(0), "_l2Bridge is the zero address");
            name = _name;
            symbol = _symbol;
            decimals = _decimals;
            owner = _owner;
            admin = _admin;
            prohibiter = _prohibiter;
            pauser = _pauser;
            wiper = _wiper;
            rescuer = _rescuer;
            l1Token = _l1Token;
            l2Bridge = _l2Bridge;

            uint256 id;
            assembly {id := chainid()}
            deploymentChainId = id;
            _DOMAIN_SEPARATOR = _calculateDomainSeparator(id);
    }

    function transfer(address _recipient, uint256 _amount) public whenNotPaused onlyNotProhibited(msg.sender) onlyNotProhibited(_recipient) isNaturalNumber(_amount) returns (bool) {
        _transfer(msg.sender, _recipient, _amount);
        return true;
    }

    function transferFrom(address _sender, address _recipient, uint256 _amount) public whenNotPaused onlyNotProhibited(_sender) onlyNotProhibited(_recipient) isNaturalNumber(_amount) returns (bool) {
        return super.transferFrom(_sender, _recipient, _amount);
    }

    function mint(address _to, uint256 _amount) public onlyL2Bridge {
        _mint(_to, _amount);

        emit Mint(_to, _amount);
    }

    function burn(address _from, uint256 _amount) public onlyL2Bridge {
        _burn(_from, _amount);

        emit Burn(_from, _amount);
    }

    function _calculateDomainSeparator(uint256 chainId) private view returns (bytes32) {
        return keccak256(
            abi.encode(
            keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"),
            keccak256(bytes(name)),
            keccak256(bytes(version)),
            chainId,
            address(this)
            )
        );
    }

    function DOMAIN_SEPARATOR() external view returns (bytes32) {
        uint256 id;
        assembly {id := chainid()}
        return id == deploymentChainId ? _DOMAIN_SEPARATOR : _calculateDomainSeparator(id);
    }

    function permit(address owner, address spender, uint256 value, uint256 deadline, uint8 v, bytes32 r, bytes32 s) external {
        require(block.timestamp <= deadline, "permit expired");

        uint256 id;
        assembly {id := chainid()}

        bytes32 digest =
            keccak256(abi.encodePacked(
                "\x19\x01",
                id == deploymentChainId ? _DOMAIN_SEPARATOR : _calculateDomainSeparator(id),
                keccak256(abi.encode(
                PERMIT_TYPEHASH,
                owner,
                spender,
                value,
                nonces[owner]++,
                deadline
                ))
            ));

        require(owner != address(0) && owner == ecrecover(digest, v, r, s), "invalid permit");

        _approve(owner, spender, value);
    }

    function supportsInterface(bytes4 _interfaceId) public pure returns (bool) {
        bytes4 firstSupportedInterface = bytes4(keccak256("supportsInterface(bytes4)")); // ERC165
        bytes4 secondSupportedInterface = this.l1Token.selector
            ^ this.mint.selector
            ^ this.burn.selector;
        return _interfaceId == firstSupportedInterface || _interfaceId == secondSupportedInterface;
    }
}