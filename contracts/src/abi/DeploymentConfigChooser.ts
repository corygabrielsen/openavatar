import { isPublicNetwork } from '../util/NetworkUtils'
import { DeployType, DeploymentConfig } from './DeploymentConfig'
import { BetaDeploymentConfig } from './config/BetaDeploymentConfig'
import { PublicDeploymentConfig } from './config/PublicDeploymentConfig'
import { TestDeploymentConfig } from './config/TestDeploymentConfig'

export async function chooseDeploymentConfiguration(
  deployType: string,
  network: {
    name: string
    config: { chainId?: number }
  }
): Promise<DeploymentConfig> {
  let result: DeploymentConfig = TestDeploymentConfig
  if (deployType === DeployType.TEST) {
    result = TestDeploymentConfig
  } else if (deployType === DeployType.BETA) {
    result = BetaDeploymentConfig
  } else if (deployType === DeployType.PUBLIC) {
    result = PublicDeploymentConfig
  } else {
    throw new Error(`Unknown deploy type: ${deployType}`)
  }

  if (isPublicNetwork(network)) {
    process.stdout.write(`Deployment config: ${result.type}\n`)
    process.stdout.write(`Network: ${network.name}\n`)
    process.stdout.write(`Chain Id: ${network.config.chainId}\n`)
    process.stdout.write(`Deployer: ${result.deployer}\n`)

    process.stdout.write('Press any key to continue...\n')
    await new Promise((resolve) => process.stdin.once('data', resolve))
  }

  return result
}
