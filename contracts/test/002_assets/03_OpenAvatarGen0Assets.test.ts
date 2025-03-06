import { ethers } from 'hardhat'
import { TestHelper } from '../TestHelper'

describe('OpenAvatarGen0Assets', function () {
  it(`Should be able to deploy contract`, async function () {
    await TestHelper.initOpenAvatarGen0Assets(ethers)
  })
})
