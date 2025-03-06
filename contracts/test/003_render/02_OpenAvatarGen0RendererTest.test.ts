import { expect } from 'chai'
import { ethers } from 'hardhat'
import { OpenAvatarGen0Assets } from '../../src/client/OpenAvatarGen0Assets'
import { OpenAvatarGen0Renderer } from '../../src/client/OpenAvatarGen0Renderer'
import { TestHelper } from '../TestHelper'

describe('OpenAvatarGen0Renderer', function () {
  let wrapper: OpenAvatarGen0Renderer

  before(async function () {
    const openAvatarGen0Assets: OpenAvatarGen0Assets = await TestHelper.initOpenAvatarGen0Assets(ethers)
    wrapper = await TestHelper.initOpenAvatarGen0Renderer(ethers, openAvatarGen0Assets)
  })

  it(`Should have canvas id 0`, async function () {
    expect(await wrapper.getCanvasId()).to.equal(0)
  })
})
