import { AvatarPose } from '@openavatar/types'
import { BigNumber } from 'ethers'
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { BaseRunner } from './BaseRunner'
import { DebugRunner } from './DebugRunner'
import { DeployRunner } from './DeployRunner'
import { MintRunner } from './MintRunner'
import { UploadRunner } from './UploadRunner'

export class LaunchRunner extends BaseRunner {
  public async run(taskArgs: any, hre: HardhatRuntimeEnvironment) {
    await this.waitForNetwork(hre)
    const [signer] = await hre.ethers.getSigners()
    const startBalance: BigNumber = await signer.getBalance()

    // deploy the contracts
    await new DeployRunner({ logging: this.config.logging, balance: false }).run(
      { create2: taskArgs.create2, deploytype: 'test', steps: 100 },
      hre
    )
    this.console.log('POST-DEPLOY BALANCE')
    await this.logEndBalance(hre, signer, startBalance)

    // upload the assets
    const poses: AvatarPose[] = [
      AvatarPose.IdleDown0,
      AvatarPose.IdleLeft0 /*, AvatarPose.IdleRight0, AvatarPose.IdleUp0 */,
    ]
    for (const pose of poses) {
      await new UploadRunner({ logging: this.config.logging, balance: false }).run(
        { create2: taskArgs.create2, deploytype: 'test', pose: pose.name, oneeach: taskArgs.oneeach },
        hre
      )
    }
    this.console.log('POST-UPLOAD BALANCE')
    await this.logEndBalance(hre, signer, startBalance)

    // mint the owner NFTs
    await new MintRunner({ logging: this.config.logging, balance: false }).run(
      { create2: taskArgs.create2, deploytype: 'test', onlyowner: true, zero: true, npcs: true },
      hre
    )

    this.console.log('POST-MINT BALANCE')
    await this.logEndBalance(hre, signer, startBalance)

    // debug
    this.console.log('\n\nDEBUG\n\n')
    await new DebugRunner({ logging: this.config.logging }).run({ create2: taskArgs.create2, deploytype: 'test' }, hre)
  }
}
