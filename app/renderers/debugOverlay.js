import Renderer from './Renderer';

export default class DebugOverlay extends Renderer {

  draw(ctx, justEnabled, scale, {game}) {
    ctx.font = "30px Arial";
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'red';
    ctx.strokeText(`State: [${game.state}]`, 10, 30);
  }

}
