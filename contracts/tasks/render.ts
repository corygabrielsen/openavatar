import { DNA } from '@openavatar/types'
import { task } from 'hardhat/config'
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { RenderRunner } from '../src/runner/RenderRunner'

async function main(taskArgs: any, hre: HardhatRuntimeEnvironment): Promise<void> {
  await new RenderRunner().run(taskArgs, hre)
}

task('render', 'Render an OpenAvatar')
  .addFlag('create2', 'Whether to use CREATE2 addresses')
  .addOptionalParam('deploytype', 'The deploy type')
  .addOptionalPositionalParam('dna', 'The DNA', DNA.ZERO.toString())
  .setAction(async (taskArgs: any, hre: HardhatRuntimeEnvironment) => {
    await main(taskArgs, hre)
  })
