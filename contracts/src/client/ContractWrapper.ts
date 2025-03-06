import { BigNumber, Contract } from 'ethers'
import { formatEther, formatUnits } from 'ethers/lib/utils'
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { confirmIfPublicDeployment } from '../util/NetworkUtils'
import { fmtCommas } from '../util/StringUtils'

interface Config {
  logging: boolean
}
const DEFAULT_ON = true

export class ContractWrapper {
  protected readonly _hre: HardhatRuntimeEnvironment
  protected readonly _contract: Contract
  protected readonly console: {
    debug: (...args: any[]) => void
    error: (...args: any[]) => void
    log: (...args: any[]) => void
  }

  constructor(hre: HardhatRuntimeEnvironment, contract: Contract, config: Config = { logging: DEFAULT_ON }) {
    this._hre = hre
    this._contract = contract
    this.console = config.logging ? console : { debug: () => {}, error: () => {}, log: () => {} }
  }

  get contract(): Contract {
    return this._contract
  }

  async owner(): Promise<string> {
    return await this._contract.owner()
  }

  get address(): `0x${string}` {
    if (this._contract.address.startsWith === undefined) {
      console.error(`this._contract.address:`, this._contract.address)
      throw new Error(
        `this._contract.address must be a string. Got: ${typeof this._contract.address} as ${this._contract.address}`
      )
    }
    if (!this._contract.address.startsWith('0x')) {
      throw new Error(`Contract address must start with 0x`)
    }
    return this._contract.address as `0x${string}`
  }

  static validate(tokenId: number): number {
    // ensure non-negative integer
    if (tokenId < 0) {
      throw new Error(`tokenId must be non-negative`)
    }
    if (parseInt(tokenId.toString()) !== tokenId) {
      throw new Error(`tokenId must be an integer`)
    }
    return tokenId
  }

  validate(tokenId: number): number {
    return ContractWrapper.validate(tokenId)
  }

  /**
   * Confirms with the user if they are deploying to a public network.
   * @returns {Promise<void>}
   */
  async confirmIfPublicDeployment(): Promise<void> {
    return await confirmIfPublicDeployment(this._hre, this.console)
  }

  logGas(estimatedGasLimit: BigNumber, txOptions?: Record<string, any>): void {
    const leftPadWithSpaces = (value: string, width: number) => {
      return ' '.repeat(width - value.length) + value
    }

    if (txOptions && txOptions.maxFeePerGas && txOptions.maxPriorityFeePerGas) {
      let maxFeePerGasStr = formatUnits(txOptions.maxFeePerGas, 'gwei')
      let maxPriorityFeePerGasStr = formatUnits(txOptions.maxPriorityFeePerGas, 'gwei')
      const width = Math.max(maxFeePerGasStr.length, maxPriorityFeePerGasStr.length)
      maxFeePerGasStr = leftPadWithSpaces(maxFeePerGasStr, width)
      maxPriorityFeePerGasStr = leftPadWithSpaces(maxPriorityFeePerGasStr, width)
      this.console.log(`    max fee per gas          : ${maxFeePerGasStr} gwei`)
      this.console.log(`    max priority fee per gas : ${maxPriorityFeePerGasStr} gwei`)
      this.console.log(`    gas limit                : ${fmtCommas(txOptions.gasLimit)} gas`)

      const estimatedGasFees = estimatedGasLimit.mul(txOptions.maxFeePerGas.add(txOptions.maxPriorityFeePerGas))
      this.console.log(`    estimated gas fees       : ${formatEther(estimatedGasFees)} ETH`)
    }
  }
}
