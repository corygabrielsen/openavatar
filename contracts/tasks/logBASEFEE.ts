import { providers } from 'ethers'
import { formatUnits } from 'ethers/lib/utils'
import { task } from 'hardhat/config'
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { fmtCommas } from '../src/util/StringUtils'

const RED = '\x1b[31m'
const YELLOW = '\x1b[33m'
const GREEN = '\x1b[32m'

function logBlock(block: providers.Block): void {
  const timestamp = new Date(block.timestamp * 1000).toISOString().replace('T', ' ').replace('.000Z', '')
  const color =
    block.baseFeePerGas!.toNumber() > 10_000_000_000
      ? RED
      : block.baseFeePerGas!.toNumber() > 8_000_000_000
      ? YELLOW
      : GREEN
  console.log(
    `${color}# ${fmtCommas(block.number)}    ${timestamp}    ${formatUnits(block.baseFeePerGas!, 'gwei')} gwei\x1b[0m`
  )
}

async function main(taskArgs: any, hre: HardhatRuntimeEnvironment): Promise<void> {
  let block: providers.Block = await hre.ethers.provider.getBlock('latest')
  logBlock(block)

  while (block.number > 0) {
    // next block number
    const newBlock: providers.Block = await hre.ethers.provider.getBlock('latest')
    if (newBlock.number > block.number) {
      block = newBlock
      logBlock(block)
    }
  }
}

task('logBASEFEE', 'log BASEFEE').setAction(async (taskArgs: any, hre: HardhatRuntimeEnvironment) => {
  await main(taskArgs, hre)
})
