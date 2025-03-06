import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { Deployable } from '../abi/Deployable'
import { OpenAvatarGen0Token } from '../client/OpenAvatarGen0Token'
import { Contracts } from '../deploy/Deployer'
import { BaseRunner } from './BaseRunner'

import { DeploymentConfig } from '../abi/DeploymentConfig'
import { chooseDeploymentConfiguration } from '../abi/DeploymentConfigChooser'
import { fmtCommas } from '../util/StringUtils'

const RED = '\x1b[31m'
const GREEN = '\x1b[32m'
const YELLOW = '\x1b[33m'
const CYAN = '\x1b[36m'
const ENDC = '\x1b[0m'

export class WithdrawRunner extends BaseRunner {
  public async run(taskArgs: any, hre: HardhatRuntimeEnvironment): Promise<void> {
    await this.waitForNetwork(hre)
    this.logNetwork(hre)

    const beforeEthBalance = await hre.ethers.provider.getBalance(hre.ethers.provider.getSigner().getAddress())
    this.console.log(`ETH balance: ${hre.ethers.utils.formatEther(beforeEthBalance)}`)

    const gasParams = {
      maxFeePerGas: hre.ethers.utils.parseUnits(taskArgs.maxfeepergas, 'gwei'),
      maxPriorityFeePerGas: hre.ethers.utils.parseUnits(taskArgs.maxpriorityfeepergas, 'gwei'),
    }
    const gasParamsAsStringsForLogging = {
      maxFeePerGas: fmtCommas(gasParams.maxFeePerGas.toNumber() / 10 ** 9),
      maxPriorityFeePerGas: fmtCommas(gasParams.maxPriorityFeePerGas.toNumber() / 10 ** 9),
    }
    this.console.log(`Withdrawing with gas params:`)
    this.console.log(`    maxFeePerGas         : ${gasParamsAsStringsForLogging.maxFeePerGas} gwei`)
    this.console.log(`    maxPriorityFeePerGas : ${gasParamsAsStringsForLogging.maxPriorityFeePerGas} gwei`)

    // deploy the contracts
    const deploymentConfig: DeploymentConfig = await chooseDeploymentConfiguration(taskArgs.deploytype, hre.network)
    const contracts: Contracts = await Contracts.make(
      hre,
      deploymentConfig,
      { create2: taskArgs.create2 },
      { logging: this.config.logging }
    )
    if (this.config.logging) {
      contracts.log()
      this.console.log()
    }
    await contracts.confirmIfPublicDeployment(hre.network)

    const openAvatarGen0Token: OpenAvatarGen0Token = contracts[Deployable.OpenAvatarGen0Token]

    const owner = await contracts[Deployable.OpenAvatarGen0Token].owner()
    this.console.log(`${Deployable.OpenAvatarGen0Token} owner: ${CYAN}${owner}${ENDC}`)

    const contractBalance = await hre.ethers.provider.getBalance(openAvatarGen0Token.address)
    this.console.log(`Contract balance: ${CYAN}${hre.ethers.utils.formatEther(contractBalance)}${ENDC}`)

    const amount = hre.ethers.utils.parseEther(taskArgs.amount)
    this.console.log(`Withdrawing ${RED}${hre.ethers.utils.formatEther(amount)} ETH${ENDC}...`)

    const tx = await openAvatarGen0Token.withdraw(amount, gasParams)
    this.console.log(`    tx: ${tx.hash}`)
    const receipt = await tx.wait()

    const contractBalanceAfter = await hre.ethers.provider.getBalance(openAvatarGen0Token.address)
    const contractBalanceDelta = contractBalance.sub(contractBalanceAfter)
    this.console.log(
      `Contract balance: ${YELLOW}${hre.ethers.utils.formatEther(
        contractBalanceAfter
      )}${ENDC} (${RED}-${hre.ethers.utils.formatEther(contractBalanceDelta)}${ENDC})`
    )
    this.console.log(`    gas used: ${fmtCommas(receipt.gasUsed.toNumber())}`)
    this.console.log(`    gas price: ${fmtCommas(receipt.effectiveGasPrice.toNumber() / 10 ** 9)} gwei`)

    const afterEthBalance = await hre.ethers.provider.getBalance(hre.ethers.provider.getSigner().getAddress())
    const ethBalanceDelta = afterEthBalance.sub(beforeEthBalance)
    const afterEthBalanceFormat = hre.ethers.utils.formatEther(afterEthBalance)
    const beforeEthBalanceFormat = hre.ethers.utils.formatEther(beforeEthBalance)
    let decimalsPlace = 0
    if (afterEthBalanceFormat.length > beforeEthBalanceFormat.length) {
      decimalsPlace = afterEthBalanceFormat.indexOf('.') + 1
    } else {
      decimalsPlace = beforeEthBalanceFormat.indexOf('.') + 1
    }
    this.console.log(`Account balance         :  ${hre.ethers.utils.formatEther(afterEthBalance)}`)
    this.console.log(`Previous balance        :  ${hre.ethers.utils.formatEther(beforeEthBalance)}`)
    if (ethBalanceDelta.gt(0)) {
      let ethBalanceDeltaFormat = '+' + hre.ethers.utils.formatEther(ethBalanceDelta)
      let decPlace = ethBalanceDeltaFormat.indexOf('.') + 1
      if (decPlace < decimalsPlace) {
        // prepend spaces
        ethBalanceDeltaFormat = ' '.repeat(decimalsPlace - decPlace + 1) + ethBalanceDeltaFormat
      }
      this.console.log(`Account balance change  : ${GREEN}${ethBalanceDeltaFormat}${ENDC}`)
    } else {
      this.console.log(`Account balance change  : ${RED}${hre.ethers.utils.formatEther(ethBalanceDelta)}${ENDC}`)
    }
  }
}
