import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { DeploymentConfig } from '../abi/DeploymentConfig'
import { chooseDeploymentConfiguration } from '../abi/DeploymentConfigChooser'
import { Create2Deployer, Deployer, PartialContracts } from '../deploy/Deployer'
import { fmtCommas } from '../util/StringUtils'
import { BaseRunner } from './BaseRunner'

export class DeployRunner extends BaseRunner {
  public async run(taskArgs: any, hre: HardhatRuntimeEnvironment) {
    await this.waitForNetwork(hre)
    this.logNetwork(hre)
    // determine prod vs test

    const deploymentConfig: DeploymentConfig = await chooseDeploymentConfiguration(taskArgs.deploytype, hre.network)
    // construct the deployer
    const gasParams = {
      // taskArgs.maxFeePerGas is passed in as gwei, need to convert to a BigNumber wei
      maxFeePerGas: hre.ethers.utils.parseUnits(taskArgs.maxfeepergas, 'gwei'),
      maxPriorityFeePerGas: hre.ethers.utils.parseUnits(taskArgs.maxpriorityfeepergas, 'gwei'),
    }
    const gasParamsAsStringsForLogging = {
      maxFeePerGas: fmtCommas(gasParams.maxFeePerGas.toNumber() / 10 ** 9),
      maxPriorityFeePerGas: fmtCommas(gasParams.maxPriorityFeePerGas.toNumber() / 10 ** 9),
    }
    this.console.log(`Deploying with gas params:`)
    this.console.log(`    maxFeePerGas         : ${gasParamsAsStringsForLogging.maxFeePerGas} gwei`)
    this.console.log(`    maxPriorityFeePerGas : ${gasParamsAsStringsForLogging.maxPriorityFeePerGas} gwei`)
    const deployer: Deployer = taskArgs.create2
      ? await Create2Deployer.make(hre, deploymentConfig, { logging: this.config.logging }, gasParams)
      : await Deployer.make(hre, deploymentConfig, { logging: this.config.logging }, gasParams)
    if (this.config.logging) {
      this.console.log(`Deployer: ${deployer.address}`)
    }
    await deployer.confirmIfPublicDeployment()
    if (this.config.logging) {
      this.console.log()
    }

    // deploy the contracts
    const contracts: PartialContracts = await deployer.deploySteps(
      taskArgs.steps === undefined ? 0 : parseInt(taskArgs.steps)
    )
    if (this.config.logging) {
      contracts.log()
    }
    this.logEndBalance(hre, deployer.signer, deployer.startBalance)
  }
}
