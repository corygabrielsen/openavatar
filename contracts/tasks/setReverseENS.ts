import { task } from 'hardhat/config'
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { DeploymentConfig } from '../src/abi/DeploymentConfig'
import { PublicDeploymentConfig } from '../src/abi/config/PublicDeploymentConfig'
import { OpenAvatarGen0Token } from '../src/client/OpenAvatarGen0Token'
import { Contracts } from '../src/deploy/Deployer'
import { fmtCommas } from '../src/util/StringUtils'

// Define the Hardhat task
task('setReverseENS', 'Set reverse ENS for a contract')
  // .addParam('contract', 'The address of the contract for which to set the reverse ENS')
  .addParam('name', 'The ENS name to set')
  .addOptionalParam('maxfeepergas', 'The max fee per gas')
  .addOptionalParam('maxpriorityfeepergas', 'The max priority fee per gas')
  .setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
    // Define the expected wallet address for verification purposes
    const signerAddress = '0x000000004d8656ac38379a6abf3ba6e800785e92'

    // Fetch the default signer from the Hardhat environment
    const [signer] = await hre.ethers.getSigners()
    const checkSignerAddress = await signer.getAddress()

    // Check if the signer matches the expected wallet address
    if (signerAddress.toLowerCase() !== checkSignerAddress.toLowerCase()) {
      throw new Error('Unexpected signer address: ' + checkSignerAddress)
    }

    const beforeEthBalance = await hre.ethers.provider.getBalance(hre.ethers.provider.getSigner().getAddress())
    console.log(`ETH balance: ${hre.ethers.utils.formatEther(beforeEthBalance)}`)

    const gasParams = {
      maxFeePerGas: hre.ethers.utils.parseUnits(taskArgs.maxfeepergas, 'gwei'),
      maxPriorityFeePerGas: hre.ethers.utils.parseUnits(taskArgs.maxpriorityfeepergas, 'gwei'),
    }
    const gasParamsAsStringsForLogging = {
      maxFeePerGas: fmtCommas(gasParams.maxFeePerGas.toNumber() / 10 ** 9),
      maxPriorityFeePerGas: fmtCommas(gasParams.maxPriorityFeePerGas.toNumber() / 10 ** 9),
    }
    console.log(`Setting ENS name to ${taskArgs.name} with gas params:`)
    console.log(`    maxFeePerGas         : ${gasParamsAsStringsForLogging.maxFeePerGas} gwei`)
    console.log(`    maxPriorityFeePerGas : ${gasParamsAsStringsForLogging.maxPriorityFeePerGas} gwei`)

    const deploymentConfig: DeploymentConfig = PublicDeploymentConfig
    const contracts: Contracts = await Contracts.make(hre, deploymentConfig, { create2: true }, { logging: true })
    const contract: OpenAvatarGen0Token = contracts.OpenAvatarGen0Token

    // Define the address of the ENS Public Resolver and the Reverse Registrar
    const ENS_PUBLIC_RESOLVER = '0x231b0Ee14048e9dCcD1d247744d114a4EB5E8E63'
    const ReverseRegistrar = '0xa58E81fe9b61B5c3fE2AFD33CF304c454AbFc7Cb'

    // Get a contract instance for the target contract using its ABI
    const ENS_REGISTRY_WITH_FALLBACK_ADDRESS = '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e'

    // Call the claimReverseENS method on your contract
    console.log('Calling claimReverseENS...')
    const claimTx = await contract.claimReverseENS(ENS_REGISTRY_WITH_FALLBACK_ADDRESS, signerAddress, gasParams)
    await claimTx.wait()
    console.log('Claimed reverse ENS successfully!')

    // Define the ABI for the Reverse Registrar contract
    const ReverseRegistrarABI = [
      {
        inputs: [
          {
            internalType: 'address',
            name: 'addr',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'owner',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'resolver',
            type: 'address',
          },
          {
            internalType: 'string',
            name: 'name',
            type: 'string',
          },
        ],
        name: 'setNameForAddr',
        outputs: [
          {
            internalType: 'bytes32',
            name: '',
            type: 'bytes32',
          },
        ],
        stateMutability: 'nonpayable',
        type: 'function',
      },
    ]

    // Create a contract instance for the Reverse Registrar
    const reverseRegistrar = await hre.ethers.getContractAt(ReverseRegistrarABI, ReverseRegistrar)

    // Call the setNameForAddr method on the Reverse Registrar to set the ENS name for the contract
    console.log('Calling setNameForAddr...')
    const estimatedGas = await reverseRegistrar.estimateGas.setNameForAddr(
      contract.address,
      signerAddress,
      ENS_PUBLIC_RESOLVER,
      taskArgs.name
    )
    const txOptions: Record<string, any> = gasParams
      ? { ...gasParams, gasLimit: estimatedGas }
      : { gasLimit: estimatedGas }
    contract.logGas(estimatedGas, txOptions) // hacky
    await contract.confirmIfPublicDeployment() // hacky
    const setNameTx = await reverseRegistrar.setNameForAddr(
      contract.address,
      signerAddress,
      ENS_PUBLIC_RESOLVER,
      taskArgs.name,
      txOptions
    )
    await setNameTx.wait()

    console.log('Set reverse ENS name successfully!')
  })

// Best Practices and Notes:
// 1. Always check if the signer matches the expected address, especially if performing crucial tasks.
// 2. Consider adding error handling mechanisms to handle any failed transactions or unexpected events.
// 3. Test all tasks on a testnet or a local development environment before running them on the mainnet to avoid potential loss or unintended actions.
// 4. Always keep your private keys and sensitive data secure. Avoid hardcoding them directly into scripts.
