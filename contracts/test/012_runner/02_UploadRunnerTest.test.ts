import * as hre from 'hardhat'
import { network } from 'hardhat'
import { DeployRunner } from '../../src/runner/DeployRunner'
import { UploadRunner } from '../../src/runner/UploadRunner'

describe('UploadRunner', function () {
  beforeEach(async function () {
    await network.provider.request({
      method: 'hardhat_reset',
      params: [],
    })
    await new DeployRunner({ logging: true }).run(
      { create2: false, deploytype: 'test', maxfeepergas: 10, maxpriorityfeepergas: 0.1 },
      hre
    )
  })

  // eslint-disable-next-line mocha/no-skipped-tests
  it.skip('Should be able to run --oneeach without error', async function () {
    await new UploadRunner({ logging: false }).run(
      { create2: false, deploytype: 'test', pose: 'IdleDown0', oneeach: true },
      hre
    )
  })

  // eslint-disable-next-line mocha/no-skipped-tests
  it.skip('Should be able to run and upload all without error', async function () {
    await new UploadRunner({ logging: false }).run({ create2: false, deploytype: 'test', pose: 'IdleDown0' }, hre)
  })
})
