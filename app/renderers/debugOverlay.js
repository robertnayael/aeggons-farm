export default function (ctx, justEnabled, scale, controls, game, map, player) {

  ctx.font = "30px Arial";
  ctx.lineWidth = 1;
  ctx.strokeStyle = 'red';
  ctx.strokeText(`State: [${game.state}]`, 10, 30);

}
