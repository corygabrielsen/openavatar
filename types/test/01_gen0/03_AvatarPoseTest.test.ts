import { expect } from 'chai'
import { AvatarPose } from 'src/gen0/AvatarPose'

describe('AvatarPose', function () {
  it('Should have correct names and canvasIds', function () {
    for (const pose of AvatarPose.iter()) {
      const { name, canvasId } = pose
      expect(AvatarPose.fromName(name)).to.equal(pose)
      expect(AvatarPose.fromCanvasId(canvasId)).to.equal(pose)
    }
  })

  it('Should correctly handle the get method', function () {
    for (const pose of AvatarPose.iter()) {
      const { name, canvasId } = pose
      expect(AvatarPose.get(name)).to.equal(pose)
      expect(AvatarPose.get(canvasId)).to.equal(pose)
    }

    expect(() => AvatarPose.get('InvalidName')).to.throw()
    expect(() => AvatarPose.get(AvatarPose.maxCanvasId + 1)).to.throw()
  })

  it('Should iterate through all AvatarPose instances in the correct order', function () {
    const poses = Array.from(AvatarPose.iter())
    expect(poses).to.have.lengthOf(AvatarPose.maxCanvasId + 1)
    expect(poses[0]).to.equal(AvatarPose.IdleDown0)
    expect(poses[1]).to.equal(AvatarPose.WalkDown0)
    expect(poses[2]).to.equal(AvatarPose.WalkDown1)
    expect(poses[3]).to.equal(AvatarPose.IdleLeft0)
    expect(poses[4]).to.equal(AvatarPose.WalkLeft0)
    expect(poses[5]).to.equal(AvatarPose.WalkLeft1)
    expect(poses[6]).to.equal(AvatarPose.IdleRight0)
    expect(poses[7]).to.equal(AvatarPose.WalkRight0)
    expect(poses[8]).to.equal(AvatarPose.WalkRight1)
    expect(poses[9]).to.equal(AvatarPose.IdleUp0)
    expect(poses[10]).to.equal(AvatarPose.WalkUp0)
    expect(poses[11]).to.equal(AvatarPose.WalkUp1)
  })

  it('Should handle the fromCanvasId method with invalid canvasIds', function () {
    expect(() => AvatarPose.fromCanvasId(-1)).to.throw()
    expect(() => AvatarPose.fromCanvasId(AvatarPose.maxCanvasId + 1)).to.throw()
  })

  it('Should handle the fromName method with invalid names', function () {
    expect(() => AvatarPose.fromName('InvalidName')).to.throw()
  })

  it('Should have correct max canvas id', function () {
    const poses: AvatarPose[] = [...AvatarPose.iter()]
    expect(AvatarPose.maxCanvasId).to.equal(poses.length - 1)
    let foundMax = -1
    for (const pose of poses) {
      if (pose.canvasId > foundMax) {
        foundMax = pose.canvasId
      }
    }
  })
})
