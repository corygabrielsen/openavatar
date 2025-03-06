import { getAddress } from '@ethersproject/address'
import { task } from 'hardhat/config'
import { HardhatRuntimeEnvironment } from 'hardhat/types'

async function main(taskArgs: any, hre: HardhatRuntimeEnvironment): Promise<void> {
  const blockNumber = await hre.ethers.provider.getBlockNumber()
  console.log(`Network is up. Block number: ${blockNumber}`)

  const { address } = taskArgs

  // Normalize the address
  console.log(`Checking address:          ${address}`)
  const normalizedAddress = getAddress(address)
  console.log(`Normalized address:        ${normalizedAddress}`)

  // Reverse resolution
  let ensName = await hre.ethers.provider.lookupAddress(normalizedAddress)
  console.log(`Reverse resolved ENS name: ${ensName}`)

  if (!ensName) {
    console.log(`No ENS name for this address.`)
    return
  }

  // Forward resolution
  const resolvedAddress = await hre.ethers.provider.resolveName(ensName)
  const normalizedResolvedAddress = getAddress(resolvedAddress || '')
  console.log(`Forward resolved address:  ${normalizedResolvedAddress}`)

  if (normalizedResolvedAddress !== normalizedAddress) {
    console.log(`Forward resolution does not match.`)
    return
  }

  console.log(`ENS resolution is correct. 🎉`)
}

task('checkENS', 'Check ENS Reverse Resolution')
  .addParam('address', 'The address to check')
  .setAction(async (taskArgs: any, hre: HardhatRuntimeEnvironment) => {
    await main(taskArgs, hre)
  })
