const MAX_INT = '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';
const randomId = () => Math.floor(Math.random() * 10000000000)

exports.signERC2612Permit = async (
    provider,
    tokenAddress,
    owner,
    spender,
    value=MAX_INT,
    deadline,
    nonce,
    name,
    chainId,
    version='1',
  ) => {
    const message = {
      owner,
      spender,
      value,
      nonce,
      deadline: deadline || MAX_INT,
    }
  
    const domain = await getDomain(tokenAddress, version, name, chainId)
    const typedData = createTypedERC2612Data(message, domain)
    const sig = await signData(provider, owner, typedData)
  
    return { ...sig, ...message }
  }

const EIP712Domain = [
    { name: 'name', type: 'string' },
    { name: 'version', type: 'string' },
    { name: 'chainId', type: 'uint256' },
    { name: 'verifyingContract', type: 'address' },
  ]

const createTypedERC2612Data = (message, domain) => {
    const typedData = {
      types: {
        EIP712Domain,
        Permit: [
          { name: 'owner', type: 'address' },
          { name: 'spender', type: 'address' },
          { name: 'value', type: 'uint256' },
          { name: 'nonce', type: 'uint256' },
          { name: 'deadline', type: 'uint256' },
        ],
      },
      primaryType: 'Permit',
      domain,
      message,
    }
    return typedData
  }

const getDomain = async (tokenAddress, version, name, chainId) => {

    const domain = { name, version, chainId, verifyingContract: tokenAddress }
    return domain
}


const signData = async (provider, fromAddress, typeData)  => {
    const typeDataString = typeof typeData === 'string' ? typeData : JSON.stringify(typeData)
    const result = await send(provider, 'eth_signTypedData_v4', [fromAddress, typeDataString]).catch((error) => {
      if (error.message === 'Method eth_signTypedData_v4 not supported.') {
        return send(provider, 'eth_signTypedData', [fromAddress, typeData])
      } else {
        throw error
      }
    })
  
    return {
      r: result.slice(0, 66),
      s: `0x${result.slice(66, 130)}`,
      v: parseInt(result.slice(130, 132), 16),
    }
  }

  const send = (provider, method, params) =>
  new Promise((resolve, reject) => {
    const payload = {
      id: randomId(),
      method,
      params,
    }
    const callback = (err, result) => {
      if (err) {
        reject(err)
      } else if (result.error) {
        //console.error(result.error)
        reject(result.error)
      } else {
        resolve(result.result)
      }
    }

    const _provider = provider.provider || provider

    if (_provider.sendAsync) {
      _provider.sendAsync(payload, callback)
    } else {
      _provider.send(payload, callback)
    }
  })