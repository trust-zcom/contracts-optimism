pragma solidity 0.5.13;

import "@openzeppelin/upgrades/contracts/Initializable.sol";
import "./Roles/Owner.sol";

contract ArbToken_v1 is Initializable, Owner {

    string public name;
    string public symbol;
    uint8 public decimals;
    address public l1Address;
    address public l2Gateway;
    bytes32 private _DOMAIN_SEPARATOR;
    uint256 public deploymentChainId;
    mapping (address => uint256) public nonces;

    string public constant version  = "1";
    bytes32 public constant PERMIT_TYPEHASH = keccak256("Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)");

    event Mint(address indexed mintee, uint256 amount, address indexed sender);
    event Burn(address indexed burnee, uint256 amount, address indexed sender);

    modifier onlyGateway {
        require(msg.sender == l2Gateway, "ONLY_GATEWAY");
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
        address _l1Address,
        address _l2Gateway
        ) public initializer {
            require(_owner != address(0), "_owner is the zero address");
            require(_admin != address(0), "_admin is the zero address");
            require(_prohibiter != address(0), "_prohibiter is the zero address");
            require(_pauser != address(0), "_pauser is the zero address");
            require(_wiper != address(0), "_wiper is the zero address");
            require(_rescuer != address(0), "_rescuer is the zero address");
            require(_l1Address != address(0), "_l1Address is the zero address");
            require(_l2Gateway != address(0), "_l2Gateway is the zero address");
            name = _name;
            symbol = _symbol;
            decimals = _decimals;
            owner = _owner;
            admin = _admin;
            prohibiter = _prohibiter;
            pauser = _pauser;
            wiper = _wiper;
            rescuer = _rescuer;
            l1Address = _l1Address;
            l2Gateway = _l2Gateway;

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

    /**
    * @notice Mint tokens on L2. Callable path is L1Gateway depositToken (which handles L1 escrow), which triggers L2Gateway, which calls this
    * @param account recipient of tokens
    * @param amount amount of tokens minted
    */
    function bridgeMint(address account, uint256 amount) external onlyGateway {
        _mint(account, amount);
        emit Mint(account, amount, msg.sender);
    }

    /**
    * @notice Burn tokens on L2.
    * @dev only the token bridge can call this
    * @param account owner of tokens
    * @param amount amount of tokens burnt
    */
    function bridgeBurn(address account, uint256 amount) external onlyGateway {
        _burn(account, amount);
        emit Burn(account, amount, msg.sender);
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
}