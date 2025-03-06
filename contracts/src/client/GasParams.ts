import { BigNumber } from 'ethers'

export type GasParams = {
  maxFeePerGas?: BigNumber
  maxPriorityFeePerGas?: BigNumber
}
