/**
 * Use this file to configure your truffle project. It's seeded with some
 * common settings for different networks and features like migrations,
 * compilation and testing. Uncomment the ones you need or modify
 * them to suit your project as necessary.
 *
 * More information about configuration can be found at:
 *
 * truffleframework.com/docs/advanced/configuration
 *
 * To deploy via Infura you'll need a wallet provider (like truffle-hdwallet-provider)
 * to sign your transactions before they're sent to a remote public node. Infura accounts
 * are available for free at: infura.io/register.
 *
 * You'll also need a mnemonic - the twelve word phrase the wallet uses to generate
 * public/private key pairs. If you're publishing your code to GitHub make sure you load this
 * phrase from a file you've .gitignored so it doesn't accidentally become public.
 *
 */

const HDWalletProvider = require('@truffle/hdwallet-provider');
// const infuraKey = "fj4jll3k.....";
//
const fs = require('fs');
let privateKey;

if(fs.existsSync(".secret")) {
  privateKey = fs.readFileSync(".secret").toString().trim();
}
if(fs.existsSync(".secret_staging")) {
  privateKeyStaging = fs.readFileSync(".secret_staging").toString().trim();
}
if(fs.existsSync(".secret_production")) {
  privateKeyProduction = fs.readFileSync(".secret_production").toString().trim();
}


module.exports = {
  networks: {
    development: {
     host: "127.0.0.1",     // Localhost (default: none)
     port: 7545,            // Standard Ethereum port (default: none)
     network_id: "*",       // Any network (default: none)
    },
    dev: {
      host: "localhost",
      port: 8545,
      network_id: "1337",
      provider: () => new HDWalletProvider(privateKey, "http://localhost:8545"),
      gasPrice: 40000000000,
      gas: 3000000
    },
    staging: {
      host: "localhost",
      port: 8545,
      network_id: "1",
      provider: () => new HDWalletProvider(privateKeyStaging, "http://localhost:8545"),
      gasPrice: 40000000000,
      gas: 3000000
    },
    production: {
      host: "localhost",
      port: 8545,
      network_id: "1",
      provider: () => new HDWalletProvider(privateKeyProduction, "http://localhost:8545"),
      gasPrice: 40000000000,
      gas: 3000000
    },
    test: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*",
    },
  },

  // Set default mocha options here, use special reporters etc.
  mocha: {
    // timeout: 100000
  },

  // Configure your compilers
  compilers: {
    solc: {
      settings: {
        optimizer: {
          enabled: true,
        }
      }
      // version: "0.5.1",    // Fetch exact version from solc-bin (default: truffle's version)
      // docker: true,        // Use "0.5.1" you've installed locally with docker (default: false)
      // settings: {          // See the solidity docs for advice about optimization and evmVersion
      //  optimizer: {
      //    enabled: false,
      //    runs: 200
      //  },
      //  evmVersion: "byzantium"
      // }
    }
  }
}
