import { Buffer } from 'buffer'
import { Contract, ContractFactory } from 'ethers'
import { ethers } from 'hardhat'
import { mkTestDirs } from '../utils'

describe('ImageEncoder', function () {
  let contractFactory: ContractFactory
  let contract: Contract

  const hasAlphaChannel = false
  let imageData: Buffer = Buffer.from('0'.repeat(32 * 32 * 3 * 2), 'hex')

  before(async function () {
    mkTestDirs()

    // ImageEncoder
    contractFactory = await ethers.getContractFactory('ImageEncoder')
    contract = await contractFactory.deploy()
    await contract.deployed()
  })

  it(`encodePNG test`, async function () {
    await contract.encodePNG(imageData, 32, 32, hasAlphaChannel)
  })

  it(`encodeBase64PNG test`, async function () {
    await contract.encodeBase64PNG(imageData, 32, 32, hasAlphaChannel)
  })

  it(`encodeSVG test`, async function () {
    await contract.encodeSVG(imageData, 32, 32, hasAlphaChannel, 320, 320)
  })

  it(`encodeBase64SVG test`, async function () {
    await contract.encodeBase64SVG(imageData, 32, 32, hasAlphaChannel, 320, 320)
  })
})
