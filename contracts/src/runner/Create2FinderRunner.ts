import { BigNumber, Contract } from 'ethers'
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { DeploymentConfig } from '../abi/DeploymentConfig'
import { chooseDeploymentConfiguration } from '../abi/DeploymentConfigChooser'
import { GasParams } from '../client/GasParams'
import { Create2SaltInfo, searchCreate2Address } from '../deploy/Create2'
import { Create2Deployer } from '../deploy/Deployer'
import { fmtCommas } from '../util/StringUtils'
import { BaseRunner } from './BaseRunner'

export class Create2FinderRunner extends BaseRunner {
  public async run(taskArgs: any, hre: HardhatRuntimeEnvironment): Promise<void> {
    await this.waitForNetwork(hre)
    this.logNetwork(hre)

    const deploymentConfig: DeploymentConfig = await chooseDeploymentConfiguration(taskArgs.deploytype, hre.network)
    // deploy the contracts
    const create2Deployer: Create2Deployer = (await Create2Deployer.make(
      hre,
      deploymentConfig,
      {
        logging: this.config.logging,
      },
      {} as GasParams
    )) as Create2Deployer
    const immutableCreate2Factory: Contract = await create2Deployer.deployFactory()

    const contractName = taskArgs.contract as string

    const saltInfo: Create2SaltInfo = {
      args: deploymentConfig.contractConfigs[contractName].args,
      bestKnownSalt: deploymentConfig.contractConfigs[contractName].bestKnownSalt,
    }

    // log expected number of checks based on number of leading zeros requested
    for (let i = 1; i <= parseInt(taskArgs.zeros); i++) {
      console.log(`${i} leading zeros expected after ${fmtCommas(16 ** i)} addresses checked`)
    }

    const create2Address = searchCreate2Address(
      {
        hre,
        leadingZeros: parseInt(taskArgs.zeros),
        factoryAddress: immutableCreate2Factory.address as `0x${string}`,
        contractName,
        args: saltInfo.args,
        abi: deploymentConfig.contractConfigs[contractName].abi,
        bytecode: deploymentConfig.contractConfigs[contractName].bytecode,
        limit: parseInt(taskArgs.limit),
        first: BigNumber.from(saltInfo.bestKnownSalt),
      },
      deploymentConfig.contractConfigs[contractName].create2Address
    )
    console.log(create2Address)
  }
}
