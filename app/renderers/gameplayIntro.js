import {fadeIn} from './effects';

let opacity = fadeIn(180);

export default function(ctx, justEnabled, scale, controls, game, map, player) {

  if (justEnabled) opacity = fadeIn(180);


  ctx.globalAlpha = opacity();
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, map.viewport.width.px, map.viewport.height.px);
  ctx.globalAlpha = 1;

}
