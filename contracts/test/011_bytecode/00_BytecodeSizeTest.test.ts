import { expect } from 'chai'
import { Deployable } from '../../src/abi/Deployable'
import { TestDeploymentConfig } from '../../src/abi/config/TestDeploymentConfig'
import { fmtCommas } from '../../src/util/StringUtils'

const MAX_DEPLOYED_BYTECODE_SIZE = 24576

const LPAD = Object.values(Deployable).reduce((max, deployable) => {
  const len = deployable.length
  return len > max ? len : max
}, 0)

describe(`Deployed bytecode <= ${fmtCommas(MAX_DEPLOYED_BYTECODE_SIZE)}B`, function () {
  Object.values(Deployable).forEach((deployable: Deployable) => {
    const bytecodeHexstring: `0x${string}` = TestDeploymentConfig.contractConfigs[deployable].deployedBytecode
    const bytecode: Buffer = Buffer.from(bytecodeHexstring.slice(2), 'hex')
    const bytecodeSize: number = bytecode.length

    it(`${deployable.padEnd(LPAD, ' ')} ${fmtCommas(bytecodeSize).padStart(
      fmtCommas(MAX_DEPLOYED_BYTECODE_SIZE).length,
      ' '
    )}B <= ${fmtCommas(MAX_DEPLOYED_BYTECODE_SIZE)}`, function () {
      expect(bytecodeSize, `${deployable} bytecode size: ${fmtCommas(bytecode.length)}`).to.be.lessThanOrEqual(
        MAX_DEPLOYED_BYTECODE_SIZE
      )
    })
  })
})
