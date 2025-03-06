import { expect } from 'chai'
import { ethers } from 'hardhat'
import { OpenAvatarGen0Assets } from '../../src/client/OpenAvatarGen0Assets'
import { OpenAvatarGen0ExampleMutableCanvasRenderer } from '../../src/client/extensions/example/OpenAvatarGen0ExampleMutableCanvasRenderer'
import { TestHelper } from '../TestHelper'

describe('OpenAvatarGen0ExampleMutableCanvasRenderer', function () {
  let openAvatarGen0Assets: OpenAvatarGen0Assets
  let openAvatarGen0ExampleMutableCanvasRenderer: OpenAvatarGen0ExampleMutableCanvasRenderer

  async function doInit() {
    openAvatarGen0Assets = await TestHelper.initOpenAvatarGen0Assets(ethers)
    await openAvatarGen0Assets.addCanvas({ id: 0, width: 32, height: 32 })
    openAvatarGen0ExampleMutableCanvasRenderer = await TestHelper.initOpenAvatarGen0ExampleMutableCanvasRenderer(
      ethers,
      openAvatarGen0Assets
    )
  }

  describe('Initialization', function () {
    beforeEach(doInit)
    it(`Should initialize with canvas id 0`, async function () {
      expect(await openAvatarGen0ExampleMutableCanvasRenderer.getCanvasId()).to.equal(0)
    })
  })

  describe('setCanvasId', function () {
    beforeEach(doInit)
    it(`Should be able to set canvas id to current canvas id value`, async function () {
      const canvasId: number = await openAvatarGen0ExampleMutableCanvasRenderer.getCanvasId()
      await openAvatarGen0ExampleMutableCanvasRenderer.setCanvasId(canvasId)
      expect(await openAvatarGen0ExampleMutableCanvasRenderer.getCanvasId()).to.equal(canvasId)
    })

    it(`Should not be able to set canvas id until canvas initialized in underlying asset store`, async function () {
      const newCanvasId: number = 1
      await expect(openAvatarGen0ExampleMutableCanvasRenderer.setCanvasId(newCanvasId)).to.be.revertedWith(
        `CanvasDoesNotExist(${newCanvasId})`
      )
      await openAvatarGen0Assets.addCanvas({ id: newCanvasId, width: 32, height: 32 })
      await openAvatarGen0ExampleMutableCanvasRenderer.setCanvasId(newCanvasId)
      expect(await openAvatarGen0ExampleMutableCanvasRenderer.getCanvasId()).to.equal(newCanvasId)
    })

    it(`Should not be able to set canvas id back and forth`, async function () {
      const canvasId: number = await openAvatarGen0ExampleMutableCanvasRenderer.getCanvasId()
      const newCanvasId: number = 1
      expect(canvasId).to.not.equal(newCanvasId)
      await openAvatarGen0Assets.addCanvas({ id: newCanvasId, width: 32, height: 32 })

      // set to new canvas id
      await openAvatarGen0ExampleMutableCanvasRenderer.setCanvasId(newCanvasId)
      expect(await openAvatarGen0ExampleMutableCanvasRenderer.getCanvasId()).to.equal(newCanvasId)

      // set back to original canvas id
      await openAvatarGen0ExampleMutableCanvasRenderer.setCanvasId(canvasId)
      expect(await openAvatarGen0ExampleMutableCanvasRenderer.getCanvasId()).to.equal(canvasId)

      // set to new canvas id
      await openAvatarGen0ExampleMutableCanvasRenderer.setCanvasId(newCanvasId)
      expect(await openAvatarGen0ExampleMutableCanvasRenderer.getCanvasId()).to.equal(newCanvasId)

      // sanity check
      expect(canvasId).to.not.equal(newCanvasId)
    })
  })
})
