import { PNG, PNGData } from '@openavatar/assets'
import { expect } from 'chai'
import { Contract, ContractFactory } from 'ethers'
import fs from 'fs'
import { ethers } from 'hardhat'
import { mkTestDirs } from '../utils'

// const RAW_DATA_2x2_2: Buffer = Buffer.from('0x000000FF111111FF222222FF333333FF'.slice(2), 'hex')

interface TestCase {
  width: number
  height: number
  image: Uint8Array
  expectedPNG: Buffer
}

describe('PNG', function () {
  let contractFactory: ContractFactory
  let contract: Contract

  let diskTestCases: { [key: string]: TestCase } = {}

  before(function () {
    mkTestDirs()

    diskTestCases = {}
    // read pngs from disk
    const testData = `${__dirname}/../data`
    const files = fs.readdirSync(testData).filter((f) => f.endsWith('.png'))
    for (const filename of files) {
      const contents = fs.readFileSync(`${testData}/${filename}`)
      const decoded: PNGData = PNG.decode(contents)
      const key = filename.split('.')[0]
      diskTestCases[key] = {
        width: decoded.width,
        height: decoded.height,
        image: decoded.data,
        expectedPNG: contents,
      }
    }
  })

  beforeEach(async function () {
    contractFactory = await ethers.getContractFactory('PNG')
    contract = await contractFactory.deploy()
    await contract.deployed()
  })

  describe('encodePNG', function () {
    const testCases: string[] = ['test_2x2', 'test_4x4', 'test_8x8', 'test_16x16', 'test_32x32']
    async function testEncodeDecode(
      buffer: Uint8Array,
      width: number,
      height: number,
      alpha: boolean,
      expected?: Uint8Array | string
    ) {
      const response: string = await contract.encodePNG(buffer, width, height, alpha)
      expect(typeof response).to.equal('string')

      const encoded: Buffer = Buffer.from(response.slice(2), 'hex')
      const outfile: string = `${__dirname}/../data/test_${width}x${height}.png`
      fs.writeFileSync(outfile, encoded)

      // Check the PNG signature
      expect(encoded.subarray(0, 8)).to.deep.equal(PNG.SIGNATURE)

      // check the IEND
      expect(encoded.subarray(encoded.length - 12, encoded.length)).to.deep.equal(PNG.IEND)

      if (expected) {
        if (typeof expected === 'string') {
          expected = ethers.utils.arrayify(expected)
        }
        expect(encoded).to.deep.equal(expected)
      }

      // decode
      const decoded: PNGData = PNG.decode(encoded)
      expect(decoded.width).to.equal(width)
      expect(decoded.height).to.equal(height)
      expect(decoded.alpha).to.equal(alpha)
      expect(decoded.data).to.deep.equal(buffer)
    }

    // loop throught test cases
    for (let i = 0; i < testCases.length; i++) {
      const name: string = testCases[i]

      it(`Should be able to PNG encode ${name.replace('test_', '')} RGBA image buffer`, async function () {
        const tc: TestCase = diskTestCases[name]
        await testEncodeDecode(tc.image, tc.width, tc.height, true, tc.expectedPNG)
      })
    }
  })
})
