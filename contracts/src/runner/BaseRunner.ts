import { BigNumber, Signer } from 'ethers'
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { Coingecko } from '../util/Coingecko'
import { isPublicNetwork } from '../util/NetworkUtils'

interface Config {
  logging: boolean
  balance?: boolean
}
export abstract class BaseRunner {
  protected readonly console: {
    debug: (...args: any[]) => void
    warn: (...args: any[]) => void
    error: (...args: any[]) => void
    log: (...args: any[]) => void
  }

  constructor(protected config: Config = { logging: true, balance: true }) {
    this.console = this.config.logging ? console : { debug: () => {}, warn: () => {}, error: () => {}, log: () => {} }
  }

  abstract run(taskArgs: any, hre: HardhatRuntimeEnvironment): Promise<void>

  /**
   * Wait for the network to come up.
   * @param hre the hardhat runtime environment
   */
  async waitForNetwork(hre: HardhatRuntimeEnvironment) {
    const maxRetries = 3
    let retries = 0
    while (retries < maxRetries) {
      try {
        const blockNumber = await hre.ethers.provider.getBlockNumber()
        this.console.log(`Network is up. Block number: ${blockNumber}`)
        return
      } catch (e) {
        retries++
        this.console.warn(`Network is not up yet. Retrying in 3 seconds... (${retries}/${maxRetries})`)
        await new Promise((resolve) => setTimeout(resolve, 3000)) // wait for 3 seconds
      }
    }
    throw new Error('Network did not come up within the allotted time')
  }

  /**
   * Logs the network information.
   */
  protected logNetwork(hre: HardhatRuntimeEnvironment): void {
    this.console.log(`network         : ${hre.network.name}`)
    this.console.log(`chainId         : ${hre.network.config.chainId}`)
    this.console.log(`gas             : ${hre.network.config.gas}`)
    const gasPriceStr =
      hre.network.config.gasPrice === 'auto'
        ? 'auto'
        : `${hre.ethers.utils.formatUnits(hre.network.config.gasPrice, 'gwei')} gwei`
    this.console.log(`gasPrice        : ${gasPriceStr}`)
    this.console.log(`gasMultiplier   : ${hre.network.config.gasMultiplier}`)
    this.console.log()
  }

  protected async logEndBalance(hre: HardhatRuntimeEnvironment, signer: Signer, startBalance: BigNumber) {
    if (this.config.balance !== true) {
      return
    }
    // log the final balance
    const endBalance = await signer.getBalance()
    const endBalanceETH = hre.ethers.utils.formatEther(startBalance)
    const delta = endBalance.sub(startBalance)
    const deltaETH = hre.ethers.utils.formatEther(delta)

    if (isPublicNetwork(hre.network)) {
      const ethPrice = await new Coingecko().getETHPrice()
      const endBalanceUSD = ethPrice * parseFloat(endBalanceETH)
      const deltaUSD = ethPrice * parseFloat(deltaETH)
      this.console.log(`ETH Price: $${ethPrice}`)
      this.console.log(`Account balance         :  ${hre.ethers.utils.formatEther(endBalance)} ETH`)
      this.console.log(`Previous balance        :  ${endBalanceETH} ETH    ($${endBalanceUSD.toFixed(2)})`)
      this.console.log(`Account balance change  : ${deltaETH} ETH    (-$${deltaUSD.toFixed(2)})`)
    } else {
      // log just ETH
      this.console.log(`Account balance         :  ${hre.ethers.utils.formatEther(endBalance)} ETH`)
      this.console.log(`Previous balance        :  ${endBalanceETH} ETH`)
      this.console.log(`Account balance change  : ${deltaETH} ETH`)
    }
  }
}
