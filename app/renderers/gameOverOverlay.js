import {fadeOut} from './effects';

let opacity = fadeOut(180);

export default function(ctx, justEnabled, scale, controls, game, map, player) {

  if (justEnabled) opacity = fadeOut(180);

  ctx.globalAlpha = opacity();
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, map.viewport.width.px, map.viewport.height.px);

  ctx.font = "130px Arial";
  ctx.fillStyle = '#000000';
  ctx.fillText(`Game Over`, 430, 300);

  ctx.globalAlpha = 1;

};
