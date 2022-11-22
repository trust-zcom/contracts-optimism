const EthUtil = require("ethereumjs-util");
const MAX_INT = '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';
const privateKeyToAddress = require('ethereum-private-key-to-address');

const GYEN = artifacts.require("GYEN");
const ZUSD = artifacts.require("ZUSD");
const TokenV1 = artifacts.require("OpToken_v1");

const permitTypeHash = web3.utils.keccak256(
  "Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)"
);

/*
console.log(
  "permitTypeHash: ",
  permitTypeHash
);
*/

function strip0x(v) {
  return v.replace(/^0x/, "");
}

function signERC2612Permit(
  owner,
  spender,
  value,
  nonce,
  deadline,
  domainSeparator,
  privateKey
) {
  // console.log("signTransferAuthorization start");
  return signEIP712(
    domainSeparator,
    permitTypeHash,
    ["address", "address", "uint256", "uint256", "uint256"],
    [owner, spender, value, nonce, deadline],
    privateKey
  );
}
function signEIP712(domainSeparator, typeHash, types, parameters, privateKey) {
  // console.log("signEIP712 start");
  const digest = web3.utils.keccak256(
    "0x1901" +
    strip0x(domainSeparator) +
    strip0x(
      web3.utils.keccak256(
        web3.eth.abi.encodeParameters(
          ["bytes32", ...types],
          [typeHash, ...parameters]
        )
      )
    )
  );

  //console.log("digest:   \n", digest);

  return ecSign(digest, privateKey);
}

function ecSign(digest, privateKey) {
  // console.log("ecSign start");
  try {
    const { v, r, s } = EthUtil.ecsign(
      bufferFromHexString(digest),
      bufferFromHexString(privateKey)
    );

    return { v, r: hexStringFromBuffer(r), s: hexStringFromBuffer(s) };
  } catch (error) {
    console.log(error);
  }
}

function hexStringFromBufferNB(buf) {
  return "0x" + buf.toString(16);
}
function hexStringFromBuffer(buf) {
  return "0x" + buf.toString("hex");
}

function bufferFromHexString(hex) {
  return Buffer.from(strip0x(hex), "hex");
}

function makeDomainSeparator(name, version, chainId, address) {
  return web3.utils.keccak256(
    web3.eth.abi.encodeParameters(
      ["bytes32", "bytes32", "bytes32", "uint256", "address"],
      [
        web3.utils.keccak256(
          "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"
        ),
        web3.utils.keccak256(name),
        web3.utils.keccak256(version),
        chainId,
        address,
      ]
    )
  );
}

async function getSignature(pk,owner,spender,value,deadline) {

  const gyenproxy = await GYEN.deployed();
  const zusdproxy = await ZUSD.deployed();
  const tokenv1 = await TokenV1.deployed();
  console.log({gyen:gyenproxy.address,zusd:zusdproxy.address,token:tokenv1.address});

  const gyenProxiedToken = await TokenV1.at(gyenproxy.address);
  const zusdProxiedToken = await TokenV1.at(zusdproxy.address);

  const gyennonce = await gyenProxiedToken.nonces(owner);
  const gyenname = await gyenProxiedToken.name();
  const gyenchainid = await gyenProxiedToken.deploymentChainId();
  console.log({nonce:gyennonce.toString(),gyen_name:gyenname,chainid:gyenchainid.toString()});

  const zusdnonce = await zusdProxiedToken.nonces(owner);
  const zusdname = await zusdProxiedToken.name();
  const zusdchainid = await zusdProxiedToken.deploymentChainId();
  console.log({nonce:zusdnonce.toString(),zusd_name:zusdname,chainid:zusdchainid.toString()});

  //GYEN
  const gyen_domain = makeDomainSeparator(
    gyenname,
    '1',
    gyenchainid.toString(),
    gyenproxy.address
  );
  const result1 = signERC2612Permit(
    owner,
    spender,
    value=='0'? MAX_INT:value,
    gyennonce.toString(),
    deadline=='0'? MAX_INT:value,
    gyen_domain,
    pk,
  )

  console.log('\nGYEN permit signature is as below: ');
  console.log(result1)

  //ZUSD
  const zusd_domain = makeDomainSeparator(
    zusdname,
    '1',
    zusdchainid.toString(),
    zusdproxy.address
  );
  const result2 = signERC2612Permit(
    owner,
    spender,
    value=='0'? MAX_INT:value,
    zusdnonce.toString(),
    deadline=='0'? MAX_INT:value,
    zusd_domain,
    pk,
  )
  console.log('\n\nZUSD permit signature is as below: ');
  console.log(result2)

}

module.exports = async (callback) => {
  try {
    //console.log(process.argv);
    const pk = process.argv[4];
    const spender = process.argv[5];
    const value = process.argv[6];
    const deadline = process.argv[7];

    const owner = privateKeyToAddress(pk);
    console.log(`owner is ${owner}`);
    console.log(`spender is ${spender}`);
    console.log(`value is ${value=='0'? MAX_INT:value}`);
    console.log(`deadline is ${deadline=='0'? MAX_INT:deadline}`);

    await getSignature(pk,owner, spender,value,deadline);
    
  } catch (e) {
    console.log(e);
  }
  callback();
};
