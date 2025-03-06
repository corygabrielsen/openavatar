import '@nomiclabs/hardhat-ethers'
import '@nomiclabs/hardhat-etherscan'
import '@nomiclabs/hardhat-waffle'
import dotenv from 'dotenv'
import { task } from 'hardhat/config'
import 'solidity-coverage'
import './tasks/checkENS'
import './tasks/debug'
import './tasks/deploy'
import './tasks/deployNFT'
import './tasks/launch'
import './tasks/logBASEFEE'
import './tasks/mint'
import './tasks/render'
import './tasks/searchCreate2Address'
import './tasks/setReverseENS'
import './tasks/upload'
import './tasks/withdraw'
dotenv.config()

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task('accounts', 'Prints the list of accounts', async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners()

  for (const account of accounts) {
    console.log(account.address)
  }
})

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

const testAccounts = {
  mnemonic:
    process.env.MNEMONIC !== undefined
      ? process.env.MNEMONIC
      : 'test test test test test test test test test test test junk',
  path: "m/44'/60'/0'/0",
  initialIndex: 0,
  count: 20,
  passphrase: '',
}

const prodAccounts =
  process.env.PRIVATE_KEY !== undefined
    ? [process.env.PRIVATE_KEY]
    : // test test test test test test test test test test test junk
      ['0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80']

const testNetworkData = {
  accounts: process.env.TEST_WITH_PRIVATE_KEY === 'true' ? prodAccounts : testAccounts,
  allowUnlimitedContractSize: false,
  gasPrice: 10_000_000_000,
  timeout: 120 * 1000,
}

/**
 * @type import('hardhat/config').HardhatUserConfigq
 */
module.exports = {
  solidity: {
    compilers: [
      {
        version: '0.8.20',
        settings: {
          evmVersion: 'shanghai',
          optimizer: {
            enabled: true,
            runs: 1_000_000,
            details: {
              yul: true,
              yulDetails: {
                stackAllocation: true,
              },
            },
          },
          viaIR: true,
        },
        metadata: {
          bytecodeHash: 'none',
        },
      },
      {
        version: '0.5.6',
        settings: {
          optimizer: {
            enabled: true,
            runs: 800,
          },
        },
        metadata: {
          bytecodeHash: 'none',
        },
      },
    ],
  },
  networks: {
    localhost: {
      ...testNetworkData,
      url: 'http://localhost:8545',
    },
    alpha: {
      ...testNetworkData,
      url: 'https://api.openavatarnft.io:6942',
    },
    goerli: {
      url: process.env.GOERLI_URL || '',
      accounts: prodAccounts,
    },
    sepolia: {
      url: process.env.SEPOLIA_URL || '',
      accounts: prodAccounts,
    },
    mainnet: {
      url: process.env.MAINNET_URL || '',
      accounts: prodAccounts,
    },
  },
  mocha: {
    // slow in CI
    timeout: process.env.CI ? 300_000 : 90_000,
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
}
