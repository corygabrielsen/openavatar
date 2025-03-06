import { providers } from 'ethers'
import { OpenAvatarGen0Renderer } from '../../OpenAvatarGen0Renderer'

export class OpenAvatarGen0ExampleMutableCanvasRenderer extends OpenAvatarGen0Renderer {
  async setCanvasId(canvasId: number): Promise<providers.TransactionResponse> {
    return await this._contract.setCanvasId(canvasId)
  }
}
