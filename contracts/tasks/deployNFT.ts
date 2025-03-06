import { HardhatRuntimeEnvironment } from 'hardhat/types'

import { Contract, ContractFactory } from 'ethers'
import { task } from 'hardhat/config'
import { ROOT_DIR, TokenURIData, decodeTokenURI, getTokenURI, writePngToFile, writeSvgToFile } from './util'

const OPENSEA_URL_GOERLI = 'https://testnets.opensea.io/assets/goerli/CONTRACT/TOKEN_ID'

interface NFTResult {
  tokenId: number
  tokenURI: string
  imageType: 'svg' | 'png' | 'other'
  imageDecoded: string | Buffer
  filepath: string
  url: string
}

export async function handleNFT(
  hre: HardhatRuntimeEnvironment,
  contract: Contract,
  tokenId: number
): Promise<NFTResult> {
  console.log()
  console.log(`NFT ${tokenId}:`)

  // Get the tokenURI from the contract
  const tokenURI = await getTokenURI(hre, contract.address, tokenId)

  // Decode the tokenURI to get the image data
  const tokenURIData: TokenURIData = decodeTokenURI(tokenURI)
  console.log(tokenURIData.imageType)
  console.log(tokenURIData.imageDecoded)

  let filepath = ''
  if (tokenURIData.imageType === 'svg') {
    filepath = writeSvgToFile(tokenURIData.imageDecoded as string, tokenId)
    console.log(filepath.replace(ROOT_DIR, ''))
  } else if (tokenURIData.imageType === 'png') {
    filepath = writePngToFile(tokenURIData.imageDecoded as Buffer, tokenId)
    console.log(filepath.replace(ROOT_DIR, ''))
  } else {
    console.log('Unknown image type')
  }

  let url = `file://wsl.localhost/Ubuntu/home/dev/code/openavatar/contracts/${filepath.replace(ROOT_DIR, '')}`
  if (hre.network.name === 'goerli') {
    url = OPENSEA_URL_GOERLI.replace('CONTRACT', contract.address).replace('TOKEN_ID', tokenId.toString())
  }
  // bold cyan
  console.log(`\x1b[1m\x1b[36m${url}\x1b[0m`)
  console.log()

  return {
    tokenId,
    tokenURI,
    imageType: tokenURIData.imageType,
    imageDecoded: tokenURIData.imageDecoded,
    filepath,
    url,
  }
}

async function main(taskArgs: any, hre: HardhatRuntimeEnvironment): Promise<void> {
  // compile the contract (if not compiled already)
  console.log('Compiling...')
  await hre.run('compile')

  // print out the deployer address
  const accounts = await hre.ethers.getSigners()
  console.log(`Deploying from ${accounts[0].address}`)

  const accountBalance = await accounts[0].getBalance()
  console.log(`Account balance: ${hre.ethers.utils.formatEther(accountBalance)} ETH`)

  const feeData = await hre.ethers.provider.getFeeData()
  console.log(`Current BASEFEE: ${(Number(feeData.lastBaseFeePerGas) / 10 ** 9).toLocaleString()} gwei`)

  // get the ContractFactory for our contract
  const contractName: string = 'TestSVGRenderer'
  const TestSVGRenderer: ContractFactory = await hre.ethers.getContractFactory(contractName)

  // deploy the contract
  console.log()
  console.log(`Deploying ${contractName}...`)

  // confirm if not the hardhat default address
  if (accounts[0].address !== '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266') {
    const isLocalNetwork = hre.network.name === 'hardhat' || hre.network.name === 'localhost'

    // always confirm for remote networks but can skip locally if --yes is passed
    if (!isLocalNetwork || !taskArgs.yes) {
      process.stdout.write('Press any key to continue...')
      await new Promise((resolve) => process.stdin.once('data', resolve))
    }
  }
  const contract: Contract = await TestSVGRenderer.deploy()
  console.log(`tx:       ${contract.deployTransaction.hash}...`)

  // wait for the transaction to be mined
  await contract.deployTransaction.wait()

  // print the contract address
  console.log(`Deployed: ${contract.address}`)

  const N = 11
  console.log(`Minting ${N} tokens...`)
  // mint some tokens
  const tx = await contract.mintBatch(N)
  console.log(`tx:       ${tx.hash}...`)
  await tx.wait()

  for (let tokenId = 1; tokenId < N; tokenId++) {
    const nftResult = await handleNFT(hre, contract, tokenId)
  }

  const newBalance = await accounts[0].getBalance()
  console.log(`Account balance: ${hre.ethers.utils.formatEther(newBalance)} ETH`)
}

task('deployNFT', 'Deploy NFT')
  .addFlag('yes', 'Bypasses the confirmation prompt')
  .setAction(async (taskArgs: any, hre: HardhatRuntimeEnvironment) => {
    await main(taskArgs, hre)
  })
