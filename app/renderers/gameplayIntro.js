let opacity = fadeIn(180);

export default function(ctx, justEnabled, scale, controls, game, map, player) {

  if (justEnabled) opacity = fadeIn(180);


  ctx.globalAlpha = opacity();
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, map.viewport.width.px, map.viewport.height.px);
  ctx.globalAlpha = 1;

}


function fadeOut(duration) {

  const step = 1/duration;
  let opacity = 0;
  let count = 0;

  return function() {
    opacity += step;
    if (opacity > 1) opacity = 1;
    return opacity;
  };
}

function fadeIn(duration) {

  const opacity = fadeOut(duration);

  return function() {
    return 1 - opacity();
  };
}
