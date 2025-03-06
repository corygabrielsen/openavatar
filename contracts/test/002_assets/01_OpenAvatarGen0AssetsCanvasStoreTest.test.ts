import { Contract } from 'ethers'
import hre, { ethers } from 'hardhat'

import { expect } from 'chai'
import { OpenAvatarGen0AssetsCanvasStore } from '../../src/client/core/assets/OpenAvatarGen0AssetsCanvasStore'
import { TestHelper } from '../TestHelper'
import { expectOneEvent } from '../utils'

describe('OpenAvatarGen0AssetsCanvasStore', function () {
  let contract: Contract

  let wrapper: OpenAvatarGen0AssetsCanvasStore

  async function doInit() {
    contract = await TestHelper.initOpenAvatarGen0AssetsCanvasStore(ethers)

    wrapper = new OpenAvatarGen0AssetsCanvasStore(hre, contract)
  }

  /////////////////////////////////////////////////////////////////////////////
  // Basic tests
  /////////////////////////////////////////////////////////////////////////////
  describe('Initialization', function () {
    beforeEach(doInit)

    it('Contract is deployed and initial state is correct', async function () {
      // Check initial state here
      expect((await wrapper.getCanvasIds()).length).to.equal(0)
      expect(await wrapper.getNumCanvasIds()).to.equal(0)
      for (let i = 0; i < 3; i++) {
        expect(await wrapper.hasCanvas(i)).to.equal(false)
        expect(await wrapper.getCanvasHeight(i)).to.equal(0)
        expect(await wrapper.getCanvasWidth(i)).to.equal(0)
        expect(await wrapper.getCanvasNumBytes(i)).to.equal(0)
        expect(await wrapper.getCanvasNumPixels(i)).to.equal(0)
        expect(await wrapper.getCanvasHeader(i)).to.deep.equal({
          id: 0,
          width: 0,
          height: 0,
        })
      }
    })
  })

  describe('Canvas creation', function () {
    beforeEach(doInit)

    async function testCanvas(id: number, width: number, height: number) {
      expect(await wrapper.hasCanvas(id)).to.equal(true)
      expect(await wrapper.getCanvasWidth(id)).to.equal(width)
      expect(await wrapper.getCanvasHeight(id)).to.equal(height)
      expect(await wrapper.getCanvasNumPixels(id)).to.equal(width * height)
      expect(await wrapper.getCanvasNumBytes(id)).to.equal(width * height * 4)
      expect(await wrapper.getCanvasHeader(id)).to.deep.equal({
        id,
        width,
        height,
      })
    }

    async function testCanvasTotals(n: number, ids: number[] = []) {
      if (ids.length === 0) {
        ids = [...Array(n).keys()]
      }
      // check n == ids.length
      if (n !== ids.length) {
        throw new Error(`n (${n}) != ids.length (${ids.length})`)
      }
      expect((await wrapper.getCanvasIds()).length).to.equal(n)
      expect(await wrapper.getNumCanvasIds()).to.equal(n)
      for (let i = 0; i < n; i++) {
        expect(await wrapper.hasCanvas(ids[i])).to.equal(true)
      }
    }

    /////////////////////////////////////////////////////////////////////////////
    // Canvas
    /////////////////////////////////////////////////////////////////////////////

    it('Should be able to create a square canvas', async function () {
      await wrapper.addCanvas({ id: 0, width: 10, height: 10 })
      await testCanvas(0, 10, 10)
      await testCanvasTotals(1)
    })

    it('Should be able to create a rectangular canvas', async function () {
      await wrapper.addCanvas({ id: 0, width: 10, height: 20 })
      await testCanvas(0, 10, 20)
      await testCanvasTotals(1)
    })

    it('Should be able to create multiple canvases', async function () {
      await wrapper.addCanvas({ id: 0, width: 10, height: 10 })
      await testCanvas(0, 10, 10)
      await testCanvasTotals(1)

      await wrapper.addCanvas({ id: 1, width: 20, height: 20 })
      await testCanvas(0, 10, 10)
      await testCanvas(1, 20, 20)
      await testCanvasTotals(2)

      await wrapper.addCanvas({ id: 2, width: 30, height: 30 })
      await testCanvas(0, 10, 10)
      await testCanvas(1, 20, 20)
      await testCanvas(2, 30, 30)
    })

    it('Should be able to create multiple canvases out of order', async function () {
      await wrapper.addCanvas({ id: 0, width: 10, height: 10 })
      await testCanvas(0, 10, 10)
      await testCanvasTotals(1)

      await wrapper.addCanvas({ id: 2, width: 20, height: 20 })
      await testCanvas(0, 10, 10)
      await testCanvas(2, 20, 20)
      await testCanvasTotals(2, [0, 2])

      await wrapper.addCanvas({ id: 1, width: 30, height: 30 })
      await testCanvas(0, 10, 10)
      await testCanvas(2, 20, 20)
      await testCanvas(1, 30, 30)
      await testCanvasTotals(3, [0, 2, 1])
    })

    it('Should not be able to create a canvas with id > 255', async function () {
      await expect(wrapper.addCanvas({ id: 256, width: 10, height: 10 })).to.be.reverted
    })

    it('Should not be able to create a canvas with 0 width', async function () {
      const height = 10
      const width = 0
      await expect(wrapper.addCanvas({ id: 0, width, height })).to.be.revertedWith(
        `InvalidCanvasSize(${width}, ${height})`
      )
    })

    it('Should not be able to create a canvas with 0 height', async function () {
      const height = 0
      const width = 10
      await expect(wrapper.addCanvas({ id: 0, width, height })).to.be.revertedWith(
        `InvalidCanvasSize(${width}, ${height})`
      )
    })

    /////////////////////////////////////////////////////////////////////////////
    // Fuses
    /////////////////////////////////////////////////////////////////////////////

    it('Should not be able to create a canvas after burning the fuse', async function () {
      expect(await wrapper.isFuseBurnedCanAddCanvas()).to.equal(false)
      await wrapper.addCanvas({ id: 0, width: 10, height: 10 })

      const tx = await wrapper.burnFuseCanAddCanvas()
      const receipt = await tx.wait()
      expectOneEvent(receipt, 'FuseBurnedCanAddCanvas')
      expect(await wrapper.isFuseBurnedCanAddCanvas()).to.equal(true)
      // calling again should not emit event
      const tx2 = await wrapper.burnFuseCanAddCanvas()
      const receipt2 = await tx2.wait()
      expect((receipt2 as unknown as { events: any }).events).to.be.empty

      // should revert with OperationBlockedByBurnedFuse when trying to add another canvas
      await expect(wrapper.addCanvas({ id: 1, width: 10, height: 10 })).to.be.revertedWith(
        'OperationBlockedByBurnedFuse()'
      )
    })
  })
})
