import { Buffer } from 'buffer'
import { expect } from 'chai'
import { Contract, ContractFactory } from 'ethers'
import { ethers } from 'hardhat'

// this is a test file for the CRC32 library

describe('CRC32', function () {
  let contractFactory: ContractFactory
  let contract: Contract

  beforeEach(async function () {
    contractFactory = await ethers.getContractFactory('CRC32Test')
    contract = await contractFactory.deploy()
    await contract.deployed()
  })

  interface TestCase {
    data: Buffer
    expectedChecksum: number
  }

  // Test cases from https://crccalc.com/ using CRC-32 (no postfix)
  const testCases: TestCase[] = [
    {
      data: Buffer.from('hello world', 'utf8'),
      expectedChecksum: 0x0d4a1185,
    },
    { data: Buffer.from('foo', 'utf8'), expectedChecksum: 0x8c736521 },
    {
      data: Buffer.from('The quick brown fox jumps over the lazy dog', 'utf8'),
      expectedChecksum: 0x414fa339,
    },
    {
      data: Buffer.from('4948445200000004000000040806000000', 'hex'),
      expectedChecksum: 0xa9f19e7e,
    },
  ]

  for (let i = 0; i < testCases.length; i++) {
    const testCase: TestCase = testCases[i]
    it(`crc32("${testCase.data}")`, async function () {
      // returns a uint32 in solidity
      const checksum: number = await contract.crc32(testCase.data)
      expect(checksum).to.eq(testCase.expectedChecksum)
    })
  }
})
