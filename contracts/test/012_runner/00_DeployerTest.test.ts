import { expect } from 'chai'
import { Signer } from 'ethers'
import * as hre from 'hardhat'
import { ethers, network } from 'hardhat'
import { OWNER_PROXY_MASTER } from '../../src/abi/Constants'
import { Deployable } from '../../src/abi/Deployable'
import { TestDeploymentConfig } from '../../src/abi/config/TestDeploymentConfig'
import { Deployer } from '../../src/deploy/Deployer'

describe('Deployer', function () {
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

  describe('Initialization', function () {
    it('Should be able to construct Deployer', async function () {
      // construct the deployer
      const deployer: Deployer = await Deployer.make(
        hre,
        TestDeploymentConfig,
        { logging: false },
        {
          maxFeePerGas: ethers.utils.parseUnits('10', 'gwei'),
          maxPriorityFeePerGas: ethers.utils.parseUnits('0.1', 'gwei'),
        }
      )
      expect(deployer).to.not.be.undefined
      expect(deployer.address).to.not.be.undefined
      expect(deployer.address).to.equal(deployerAddress)
    })
  })

  describe('Deployments', function () {
    it('Should be able to deploy a contract using Deployer', async function () {
      // construct the deployer
      const deployer: Deployer = await Deployer.make(
        hre,
        TestDeploymentConfig,
        { logging: false },
        {
          maxFeePerGas: ethers.utils.parseUnits('10', 'gwei'),
          maxPriorityFeePerGas: ethers.utils.parseUnits('0.1', 'gwei'),
        }
      )

      // deploy a contract
      const args: any[] = [OWNER_PROXY_MASTER]
      const libraries = undefined
      const contract = await deployer.deploy(Deployable.OwnerProxy, args, libraries)
      expect(contract).to.not.be.undefined
    })

    it('Should be able to deploy all contracts using Deployer', async function () {
      // construct the deployer
      const deployer: Deployer = await Deployer.make(
        hre,
        TestDeploymentConfig,
        { logging: false },
        {
          maxFeePerGas: ethers.utils.parseUnits('10', 'gwei'),
          maxPriorityFeePerGas: ethers.utils.parseUnits('0.1', 'gwei'),
        }
      )

      // deploy all contracts
      const contracts = await deployer.deploySteps(0)
      expect(contracts).to.not.be.undefined
    })
  })
})
