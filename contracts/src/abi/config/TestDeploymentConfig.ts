import { stringToBytes32 } from '../../util/StringUtils'
import { Artifacts } from '../Artifacts'
import { OWNER_PROXY_MASTER } from '../Constants'
import { ContractConfig } from '../ContractConfig'
import { Deployable } from '../Deployable'
import { DeployType, DeploymentConfig } from '../DeploymentConfig'
import { ensureUniqueAddresses } from '../Utils'

const DEPLOYER_ADDRESS = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'

const CREATE_DEPLOYMENT_ADDRESSES = {
  [Deployable.ImmutableCreate2Factory]: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
  [Deployable.OwnerProxy]: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
  [Deployable.OpenAvatarGen0Assets]: '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9',
  [Deployable.OpenAvatarGen0RendererRegistry]: '0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9',
  [Deployable.OpenAvatarGen0Renderer]: '0x5FC8d32690cc91D4c39d9d3abcBD16989F875707',
  [Deployable.OpenAvatarGen0Token]: '0xa513E6E4b8f2a923D98304ec87F64353C4D5C853',
  [Deployable.OpenAvatarGen0TextRecords]: '0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6',
  [Deployable.OpenAvatarGen0ProfilePictureRenderer]: '0x610178dA211FEF7D417bC0e6FeD39F05609AD788',
  [Deployable.OpenAvatarGen0ExampleMutableCanvasRenderer]: '0x9A9f2CCfdE556A7E9Ff0848998Aa4a0CFD8863AE',
}

const CREATE2_DEPLOYMENT_ADDRESSES = {
  [Deployable.ImmutableCreate2Factory]: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
  [Deployable.OwnerProxy]: '0x522C3c41Db76108E15F0B69aD0bB1246Cfc69516',
  [Deployable.OpenAvatarGen0Assets]: '0xe944d36e70A6fB6132327c499Fd2f9190191a728',
  [Deployable.OpenAvatarGen0RendererRegistry]: '0xF891040c82e2dE7E954b48AaaC771D70c98d3565',
  [Deployable.OpenAvatarGen0Renderer]: '0x9988Fb1A564A492a2d15aE17EFBA1E7e57D2F890',
  [Deployable.OpenAvatarGen0Token]: '0x0d4A851305C77dec41de3A50477d3dCcbE20F8Cd',
  [Deployable.OpenAvatarGen0TextRecords]: '0xD283Be00a470C83EBE42CBAA5F2986Dd11910E40',
  [Deployable.OpenAvatarGen0ProfilePictureRenderer]: '0x7d95a980220b9D94d3cbd859D5eAa0fb34cE3FfF',
  [Deployable.OpenAvatarGen0ExampleMutableCanvasRenderer]: '0xEFd639E21d169c5AB9589F1c0BB659316Cf2A95c',
}

const Salts: Record<string, { args: any[]; bestKnownSalt: Buffer }> = {
  [Deployable.ImmutableCreate2Factory]: {
    args: [],
    bestKnownSalt: stringToBytes32('0x0'),
  },
  [Deployable.OwnerProxy]: {
    args: [OWNER_PROXY_MASTER],
    bestKnownSalt: stringToBytes32('0x0'),
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
      nonCreate2Address: CREATE_DEPLOYMENT_ADDRESSES[name],
      args: Salts[name].args,
      bestKnownSalt: Salts[name].bestKnownSalt,
    },
  }),
  {}
)

// ensure uniqueness of addresses to prevent refactor bugs
ensureUniqueAddresses(Object.values(ContractConfigs).map((c) => c.create2Address))
ensureUniqueAddresses(Object.values(ContractConfigs).map((c) => c.nonCreate2Address))

export const TestDeploymentConfig: DeploymentConfig = {
  type: DeployType.TEST,
  deployer: DEPLOYER_ADDRESS,
  contractConfigs: ContractConfigs,
}
