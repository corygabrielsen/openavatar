import { task } from 'hardhat/config'
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { LaunchRunner } from '../src/runner/LaunchRunner'

async function main(taskArgs: any, hre: HardhatRuntimeEnvironment): Promise<void> {
  await new LaunchRunner().run(taskArgs, hre)
}

task('launch', 'Launch OpenAvatar contracts')
  .addFlag('create2', 'Deploy using CREATE2')
  .addFlag('oneeach', 'Upload one each layer (for testing)')
  .setAction(async (taskArgs: any, hre: HardhatRuntimeEnvironment) => {
    await main(taskArgs, hre)
  })
