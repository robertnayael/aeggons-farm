import {fadeIn} from './effects';
import {circleIn} from './effects';

let opacity = fadeIn(180);
let radius;

export default function(ctx, justEnabled, scale, controls, game, map, player) {

  if (justEnabled) opacity = fadeIn(180);


  ctx.globalAlpha = opacity();
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, map.viewport.width.px, map.viewport.height.px);
  ctx.globalAlpha = 1;



var width = map.viewport.width.px;
var height = map.viewport.height.px;

const cornerToCenter = Math.sqrt( Math.pow((width), 2) + Math.pow((height), 2) ) / 2;

if (justEnabled) radius = circleIn(180, cornerToCenter);

  ctx.save();

  ctx.beginPath();
  ctx.arc(width/2, height/2, radius(), 0, Math.PI*2, false);
  ctx.closePath();

  ctx.moveTo(0,0);
  ctx.lineTo(0, height);
  ctx.lineTo(width,height);
  ctx.lineTo(width,0);

  ctx.closePath();

  ctx.clip();

  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, map.viewport.width.px, map.viewport.height.px);

  ctx.restore();

}
