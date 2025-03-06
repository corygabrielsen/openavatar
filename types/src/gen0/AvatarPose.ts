export class AvatarPose {
  private constructor(public readonly name: string, public readonly canvasId: number) {}

  // down
  static IdleDown0 = new AvatarPose('IdleDown0', 0)
  static WalkDown0 = new AvatarPose('WalkDown0', 1)
  static WalkDown1 = new AvatarPose('WalkDown1', 2)
  // left
  static IdleLeft0 = new AvatarPose('IdleLeft0', 3)
  static WalkLeft0 = new AvatarPose('WalkLeft0', 4)
  static WalkLeft1 = new AvatarPose('WalkLeft1', 5)
  // right
  static IdleRight0 = new AvatarPose('IdleRight0', 6)
  static WalkRight0 = new AvatarPose('WalkRight0', 7)
  static WalkRight1 = new AvatarPose('WalkRight1', 8)
  // up
  static IdleUp0 = new AvatarPose('IdleUp0', 9)
  static WalkUp0 = new AvatarPose('WalkUp0', 10)
  static WalkUp1 = new AvatarPose('WalkUp1', 11)

  static get(nameOrCanvasId: string | number): AvatarPose {
    if (typeof nameOrCanvasId === 'number') {
      return AvatarPose.fromCanvasId(nameOrCanvasId)
    } else {
      return AvatarPose.fromName(nameOrCanvasId)
    }
  }

  static iter(): IterableIterator<AvatarPose> {
    return (function* () {
      yield AvatarPose.IdleDown0
      yield AvatarPose.WalkDown0
      yield AvatarPose.WalkDown1
      yield AvatarPose.IdleLeft0
      yield AvatarPose.WalkLeft0
      yield AvatarPose.WalkLeft1
      yield AvatarPose.IdleRight0
      yield AvatarPose.WalkRight0
      yield AvatarPose.WalkRight1
      yield AvatarPose.IdleUp0
      yield AvatarPose.WalkUp0
      yield AvatarPose.WalkUp1
    })()
  }

  static fromCanvasId(canvasId: number): AvatarPose {
    switch (canvasId) {
      case 0:
        return AvatarPose.IdleDown0
      case 1:
        return AvatarPose.WalkDown0
      case 2:
        return AvatarPose.WalkDown1
      case 3:
        return AvatarPose.IdleLeft0
      case 4:
        return AvatarPose.WalkLeft0
      case 5:
        return AvatarPose.WalkLeft1
      case 6:
        return AvatarPose.IdleRight0
      case 7:
        return AvatarPose.WalkRight0
      case 8:
        return AvatarPose.WalkRight1
      case 9:
        return AvatarPose.IdleUp0
      case 10:
        return AvatarPose.WalkUp0
      case 11:
        return AvatarPose.WalkUp1
      default:
        throw new Error(`Invalid canvasId ${canvasId}`)
    }
  }

  static fromName(name: string): AvatarPose {
    switch (name) {
      case 'IdleDown0':
        return AvatarPose.IdleDown0
      case 'WalkDown0':
        return AvatarPose.WalkDown0
      case 'WalkDown1':
        return AvatarPose.WalkDown1
      case 'IdleLeft0':
        return AvatarPose.IdleLeft0
      case 'WalkLeft0':
        return AvatarPose.WalkLeft0
      case 'WalkLeft1':
        return AvatarPose.WalkLeft1
      case 'IdleRight0':
        return AvatarPose.IdleRight0
      case 'WalkRight0':
        return AvatarPose.WalkRight0
      case 'WalkRight1':
        return AvatarPose.WalkRight1
      case 'IdleUp0':
        return AvatarPose.IdleUp0
      case 'WalkUp0':
        return AvatarPose.WalkUp0
      case 'WalkUp1':
        return AvatarPose.WalkUp1
      default:
        throw new Error(`Invalid pose name ${name}`)
    }
  }

  static get maxCanvasId(): number {
    return 11
  }
}
