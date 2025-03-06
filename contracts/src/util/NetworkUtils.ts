import { BigNumber } from 'ethers'
import { formatUnits } from 'ethers/lib/utils'
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { Coingecko } from './Coingecko'
import { fmtCommas } from './StringUtils'

/**
 * Checks if the network is public.
 * @returns {boolean} - Returns true if the network is public.
 */
export function isPublicNetwork(network: { name: string; config: { chainId?: number } }): boolean {
  if (network?.name === undefined) {
    return false
  }

  const isLocalhost = ['localhost', 'hardhat', 'alpha'].includes(network.name) || network.config?.chainId === 1337

  const isGoerli = network.name === 'goerli'
  const isSepolia = network.name === 'sepolia'
  const isMainnet = network.name === 'mainnet'
  return !isLocalhost || isGoerli || isSepolia || isMainnet
}

/**
 * Confirms with the user if they are deploying to a public network.
 * @returns {Promise<void>}
 */
export async function confirmIfPublicDeployment(hre: HardhatRuntimeEnvironment, _console: { log: any }): Promise<void> {
  if (isPublicNetwork(hre.network)) {
    const [signer] = await hre.ethers.getSigners()
    const balance = await signer.getBalance()
    const balanceETH = hre.ethers.utils.formatEther(balance)
    const ethPrice = await new Coingecko().getETHPrice()
    _console.log(`    ETH Price    : $${ethPrice}`)
    const balanceUSD = ethPrice * parseFloat(balanceETH)

    // get last block
    const lastBlock = await hre.ethers.provider.getBlock('latest')
    let gasPrice: BigNumber = lastBlock.baseFeePerGas || (await hre.ethers.provider.getGasPrice())
    const timestamp = new Date(lastBlock.timestamp * 1000).toLocaleString()
    const deltaSeconds = (Date.now() - lastBlock.timestamp * 1000) / 1000
    const fmtTime = (seconds: number): string => {
      // 0h 0m 0s
      const hours = Math.floor(seconds / 3600)
      const minutes = Math.floor((seconds % 3600) / 60)
      const secs = Math.floor(seconds % 60)
      return `${hours}h ${minutes}m ${secs}s`
    }
    _console.log(`    block number : ${fmtCommas(lastBlock.number)}`)
    _console.log(`    timestamp    : ${timestamp}`)
    _console.log(`    age          : ${fmtTime(deltaSeconds)} ago`)

    const isGoerli = hre.network.name === 'goerli'
    const isSepolia = hre.network.name === 'sepolia'
    const tickerName = isGoerli ? 'GoerliETH' : isSepolia ? 'SepoliaETH' : 'ETH'
    _console.log(`    balance      : ${balanceETH} ${tickerName}    ($${fmtCommas(balanceUSD)})`)
    _console.log(`    BASEFEE      : ${formatUnits(gasPrice, 'gwei')} gwei`)
    _console.log()

    // Pause execution and wait for the user to confirm before continuing
    process.stdout.write('Press any key to continue...')
    await new Promise((resolve) => process.stdin.once('data', resolve))
    _console.log('continuing...')
  }
}
