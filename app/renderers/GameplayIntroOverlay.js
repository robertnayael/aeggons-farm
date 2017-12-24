import Renderer from './Renderer';

export default class GameplayIntroOverlay extends Renderer {


}



/*

import {fadeIn} from './effects';
import {circleOut} from './effects';

let opacity = fadeIn(180);
let radius;
let effects = [];



export default function(ctx, justEnabled, scale, controls, game, map, player, layers) {





  const width = map.viewport.width.px,
        height = map.viewport.height.px;


  if (justEnabled) {
    opacity = fadeIn(180);
  }


  ctx.globalAlpha = opacity();
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, map.viewport.width.px, map.viewport.height.px);
  ctx.globalAlpha = 1;

  if (justEnabled) effects[0] = circleOut(ctx, width, height, '#000000', 180);

  if (effects[0]() === true) {
      //console.log('czas na kolejny efekt');
  }


}*/
