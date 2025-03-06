import { Signer } from 'ethers'
import * as hre from 'hardhat'
import { ethers, network } from 'hardhat'
import { LaunchRunner } from '../../src/runner/LaunchRunner'

describe('LaunchRunner', function () {
  let accounts: Signer[]

  let deployer: Signer
  let deployerAddress: string

  beforeEach(async function () {
    await network.provider.request({
      method: 'hardhat_reset',
      params: [],
    })
    accounts = await ethers.getSigners()
    deployer = accounts[0]
    deployerAddress = await deployer.getAddress()
  })

  // eslint-disable-next-line mocha/no-skipped-tests
  it.skip('Should be able to run without error', async function () {
    await new LaunchRunner({ logging: false }).run({ create2: false }, hre)
  })
})
