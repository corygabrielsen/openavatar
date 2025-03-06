import { task } from 'hardhat/config'
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { UploadRunner } from '../src/runner/UploadRunner'

async function main(taskArgs: any, hre: HardhatRuntimeEnvironment): Promise<void> {
  await new UploadRunner().run(taskArgs, hre)
}

task('upload', 'Upload assets')
  .addFlag('create2', 'Whether to use CREATE2 addresses')
  .addFlag('oneeach', 'Upload one each layer (for testing)')
  .addOptionalParam('maxfeepergas', 'The max fee per gas')
  .addOptionalParam('maxpriorityfeepergas', 'The max priority fee per gas')
  .addOptionalParam('pose', 'AvatarPose to upload')
  .addOptionalParam('deploytype', 'The deploy type')
  .setAction(async (taskArgs: any, hre: HardhatRuntimeEnvironment) => {
    await main(taskArgs, hre)
  })
