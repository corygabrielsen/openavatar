import { task } from 'hardhat/config'
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { MintRunner } from '../src/runner/MintRunner'

async function main(taskArgs: any, hre: HardhatRuntimeEnvironment): Promise<void> {
  await new MintRunner().run(taskArgs, hre)
}

task('mint', 'Mint an OpenAvatar')
  .addFlag('create2', 'Whether to use CREATE2 addresses')
  .addFlag('infinite', 'Mint forever in an infinite loop (for testing)')
  .addFlag('npcs', 'Whether to mint the pre-configured NPC avatars')
  .addFlag('onlyowner', 'Set mint state ONLY_OWNER')
  .addFlag('public', 'Set mint state PUBLIC')
  .addFlag('zero', 'Whether to mint the zero avatar')
  .addFlag('npcbackgrounds', 'Whether to update the backgrounds of the NPC avatars')
  .addParam('deploytype', 'The deploy type')
  // .addOptionalParam('background', 'The background color')
  .addOptionalParam('maxfeepergas', 'The max fee per gas')
  .addOptionalParam('maxpriorityfeepergas', 'The max priority fee per gas')
  .addOptionalPositionalParam('dna', 'The DNA, "random"')
  .setAction(async (taskArgs: any, hre: HardhatRuntimeEnvironment) => {
    await main(taskArgs, hre)
  })
