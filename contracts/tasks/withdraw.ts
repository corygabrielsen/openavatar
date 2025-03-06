import { task } from 'hardhat/config'
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { WithdrawRunner } from '../src/runner/WithdrawRunner'

async function main(taskArgs: any, hre: HardhatRuntimeEnvironment): Promise<void> {
  await new WithdrawRunner().run(taskArgs, hre)
}

task('withdraw', 'Withdraw ETH from the contract')
  .addFlag('create2', 'Whether to use CREATE2 addresses')
  .addParam('amount', 'The amount to withdraw (wei)')
  .addParam('deploytype', 'The deploy type')
  .addOptionalParam('maxfeepergas', 'The max fee per gas')
  .addOptionalParam('maxpriorityfeepergas', 'The max priority fee per gas')
  .setAction(async (taskArgs: any, hre: HardhatRuntimeEnvironment) => {
    await main(taskArgs, hre)
  })
