import { task } from 'hardhat/config'
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { DeployRunner } from '../src/runner/DeployRunner'

async function main(taskArgs: any, hre: HardhatRuntimeEnvironment): Promise<void> {
  await new DeployRunner().run(taskArgs, hre)
}

task('deploy', 'Deploy OpenAvatar contracts')
  .addFlag('create2', 'Deploy using CREATE2')
  .addOptionalParam('maxfeepergas', 'The max fee per gas')
  .addOptionalParam('maxpriorityfeepergas', 'The max priority fee per gas')
  .addOptionalParam('deploytype', 'The deploy type')
  .addOptionalParam('steps', 'The number of deployment steps to execute')
  .setAction(async (taskArgs: any, hre: HardhatRuntimeEnvironment) => {
    await main(taskArgs, hre)
  })
