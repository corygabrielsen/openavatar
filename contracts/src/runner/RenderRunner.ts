import { AvatarConsoleDrawer } from '@openavatar/assets'
import { DNA } from '@openavatar/types'
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { Deployable } from '../abi/Deployable'
import { DeploymentConfig } from '../abi/DeploymentConfig'
import { chooseDeploymentConfiguration } from '../abi/DeploymentConfigChooser'
import { OpenAvatarGen0Renderer } from '../client/OpenAvatarGen0Renderer'
import { Contracts } from '../deploy/Deployer'
import { BaseRunner } from './BaseRunner'

export class RenderRunner extends BaseRunner {
  public async run(taskArgs: any, hre: HardhatRuntimeEnvironment): Promise<void> {
    await this.waitForNetwork(hre)
    this.logNetwork(hre)
    // deploy the contracts
    const deploymentConfig: DeploymentConfig = await chooseDeploymentConfiguration(taskArgs.deploytype, hre.network)
    const contracts: Contracts = await Contracts.make(
      hre,
      deploymentConfig,
      { create2: taskArgs.create2 },
      { logging: this.config.logging }
    )
    const renderer: OpenAvatarGen0Renderer = contracts[Deployable.OpenAvatarGen0Renderer]
    this.console.log(renderer.address, `: ${Deployable.OpenAvatarGen0Renderer}`)
    let dna: DNA = new DNA(taskArgs.hex)
    if (this.config.logging) {
      this.console.log(`dna: ${dna.toString()}`)
      this.console.log()
    }
    const uri: string = await renderer.renderURI(dna)

    // render as hexstring
    if (this.config.logging) {
      // eslint-disable-next-line no-undef
      AvatarConsoleDrawer.draw(uri)
    }
  }
}
