import { Signer } from 'ethers'
import * as hre from 'hardhat'
import { ethers, network } from 'hardhat'
import { DeployRunner } from '../../src/runner/DeployRunner'

describe('DeployRunner', function () {
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

  it('Should be able to run without error', async function () {
    await new DeployRunner({ logging: false }).run(
      { create2: false, deploytype: 'test', maxfeepergas: '10', maxpriorityfeepergas: '0.1', steps: 0 },
      hre
    )
  })
})
