import { AvatarPose, DNA } from '@openavatar/types'
import * as hre from 'hardhat'
import { network } from 'hardhat'
import { DeployRunner } from '../../src/runner/DeployRunner'
import { MintRunner } from '../../src/runner/MintRunner'
import { RenderRunner } from '../../src/runner/RenderRunner'
import { UploadRunner } from '../../src/runner/UploadRunner'

describe('RenderRunner', function () {
  beforeEach(async function () {
    await network.provider.request({
      method: 'hardhat_reset',
      params: [],
    })
    await new DeployRunner({ logging: false }).run(
      { create2: false, deploytype: 'test', maxfeepergas: 10, maxpriorityfeepergas: 0.1 },
      hre
    )
    await new UploadRunner({ logging: false }).run(
      { create2: false, pose: AvatarPose.IdleDown0.name, oneeach: true, layer: true },
      hre
    )
    await new MintRunner({ logging: false }).run({ create2: false, onlyowner: true, dna: 'random' }, hre)
  })

  // eslint-disable-next-line mocha/no-skipped-tests
  it.skip('Should be able to run all zeros without error', async function () {
    await new RenderRunner({ logging: false }).run({ create2: false, hex: DNA.ZERO.hex }, hre)
  })
})
