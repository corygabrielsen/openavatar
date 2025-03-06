import { task } from 'hardhat/config'
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { DebugRunner } from '../src/runner/DebugRunner'

async function main(taskArgs: any, hre: HardhatRuntimeEnvironment): Promise<void> {
  await new DebugRunner().run(taskArgs, hre)
}

task('debug', 'Debug OpenAvatar contracts')
  .addFlag('create2', 'Deploy using CREATE2')
  .addOptionalParam('deploytype', 'The deploy type')
  .setAction(async (taskArgs: any, hre: HardhatRuntimeEnvironment) => {
    await main(taskArgs, hre)
  })
