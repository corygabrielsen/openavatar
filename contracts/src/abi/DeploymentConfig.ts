import { ContractConfig } from './ContractConfig'

export enum DeployType {
  PUBLIC = 'public',
  BETA = 'beta',
  TEST = 'test',
}

export type DeploymentConfig = {
  type: DeployType
  deployer: `0x${string}`
  contractConfigs: Record<string, ContractConfig>
}
