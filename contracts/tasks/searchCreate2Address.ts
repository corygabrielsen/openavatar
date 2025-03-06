import { task } from 'hardhat/config'
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { Create2FinderRunner } from '../src/runner/Create2FinderRunner'

async function main(taskArgs: any, hre: HardhatRuntimeEnvironment): Promise<void> {
  await new Create2FinderRunner().run(taskArgs, hre)
}

task('searchCreate2Address', 'Search for a CREATE2 deployment address with the given number of leading zeros')
  .addParam('zeros', 'The number of zeros', undefined, undefined, false)
  .addParam('limit', 'The number of checks to make', undefined, undefined, false)
  .addParam('contract', 'The contract name', undefined, undefined, false)
  .addOptionalParam('deploytype', 'The deploy type')
  .setAction(async (taskArgs: any, hre: HardhatRuntimeEnvironment) => {
    await main(taskArgs, hre)
  })
