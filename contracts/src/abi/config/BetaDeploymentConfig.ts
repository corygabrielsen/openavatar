import { stringToBytes32 } from '../../util/StringUtils'
import { Artifacts } from '../Artifacts'
import { OWNER_PROXY_MASTER } from '../Constants'
import { ContractConfig } from '../ContractConfig'
import { Deployable } from '../Deployable'
import { DeployType, DeploymentConfig } from '../DeploymentConfig'
import { ensureUniqueAddresses } from '../Utils'

const DEPLOYER_ADDRESS = '0x00000000F8C013025adF1Eb2782790A27980373D'

const DEPLOY_ORDER: `0x${string}`[] = ['0x28e73E3d7675cBcD014A1E0DC2333c718bD1BeC5']

const CREATE2_DEPLOYMENT_ADDRESSES = {
  [Deployable.ImmutableCreate2Factory]: DEPLOY_ORDER[0],
  [Deployable.OwnerProxy]: '0x00000000F46D549608F0Fc6BE448113735006cF2',
  [Deployable.OpenAvatarGen0Assets]: '0x0000000000000000000000000000000000000002',
  [Deployable.OpenAvatarGen0RendererRegistry]: '0x0000000000000000000000000000000000000003',
  [Deployable.OpenAvatarGen0Renderer]: '0x0000000000000000000000000000000000000004',
  [Deployable.OpenAvatarGen0Token]: '0xc3C931bA8E6aa38C645960cAA17d49Dca0e00f55',
  [Deployable.OpenAvatarGen0TextRecords]: '0xA8E6Ce7D5a15C210254EB02819AC724CD6c7500A',
  [Deployable.OpenAvatarGen0ProfilePictureRenderer]: '0x0000000000000000000000000000000000000007',
  [Deployable.OpenAvatarGen0ExampleMutableCanvasRenderer]: '0x0000000000000000000000000000000000000008',
}

const Salts: Record<string, { args: any[]; bestKnownSalt: Buffer }> = {
  [Deployable.ImmutableCreate2Factory]: {
    args: [],
    bestKnownSalt: stringToBytes32('0x0'),
  },
  [Deployable.OwnerProxy]: {
    args: [OWNER_PROXY_MASTER],
    bestKnownSalt: stringToBytes32('0x00000000f8c013025adf1eb2782790a27980373d309ede1ad3f3e0037ff5be8c'),
  },
  [Deployable.OpenAvatarGen0Assets]: {
    args: [CREATE2_DEPLOYMENT_ADDRESSES[Deployable.OwnerProxy]],
    bestKnownSalt: stringToBytes32('0x0'),
  },
  [Deployable.OpenAvatarGen0RendererRegistry]: {
    args: [CREATE2_DEPLOYMENT_ADDRESSES[Deployable.OwnerProxy]],
    bestKnownSalt: stringToBytes32('0x0'),
  },
  [Deployable.OpenAvatarGen0Renderer]: {
    args: [CREATE2_DEPLOYMENT_ADDRESSES[Deployable.OwnerProxy]],
    bestKnownSalt: stringToBytes32('0x0'),
  },
  [Deployable.OpenAvatarGen0Token]: {
    args: [CREATE2_DEPLOYMENT_ADDRESSES[Deployable.OwnerProxy]],
    bestKnownSalt: stringToBytes32('0x0'),
  },
  [Deployable.OpenAvatarGen0TextRecords]: {
    args: [CREATE2_DEPLOYMENT_ADDRESSES[Deployable.OwnerProxy]],
    bestKnownSalt: stringToBytes32('0x0'),
  },
  [Deployable.OpenAvatarGen0ProfilePictureRenderer]: {
    args: [CREATE2_DEPLOYMENT_ADDRESSES[Deployable.OwnerProxy]],
    bestKnownSalt: stringToBytes32('0x0'),
  },
  [Deployable.OpenAvatarGen0ExampleMutableCanvasRenderer]: {
    args: [CREATE2_DEPLOYMENT_ADDRESSES[Deployable.OwnerProxy]],
    bestKnownSalt: stringToBytes32('0x0'),
  },
}

const ContractConfigs: Record<string, ContractConfig> = Object.values(Deployable).reduce(
  (acc, name, i) => ({
    ...acc,
    [name]: {
      abi: Artifacts.get(name)?.abi,
      bytecode: Artifacts.get(name)?.bytecode,
      deployedBytecode: Artifacts.get(name)?.deployedBytecode,
      create2Address: CREATE2_DEPLOYMENT_ADDRESSES[name],
      nonCreate2Address: DEPLOY_ORDER[i],
      args: Salts[name].args,
      bestKnownSalt: Salts[name].bestKnownSalt,
    },
  }),
  {}
)

// ensure uniqueness of addresses to prevent refactor bugs
ensureUniqueAddresses(Object.values(ContractConfigs).map((c) => c.create2Address))
// ensureUniqueAddresses(Object.values(ContractConfigs).map((c) => c.nonCreate2Address))

export const BetaDeploymentConfig: DeploymentConfig = {
  type: DeployType.BETA,
  deployer: DEPLOYER_ADDRESS,
  contractConfigs: ContractConfigs,
}
