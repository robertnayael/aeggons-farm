function timestamp() {
  if (window.performance && window.performance.now)
    return window.performance.now();
  else
    return new Date().getTime();
}

/*------------------------------------------------------------------------*/

let delta = 0,                                   // delta between now and last
    now,
    last = timestamp(),
    step,
    canvas,
    ctx,
    activeRenderers;

/*------------------------------------------------------------------------*/

function frameLoop() {
  now = timestamp();                            // time at the start of this loop
  delta = delta + Math.min(1, (now - last) / 1000);
  while(delta > step) {                         // make sure the game catches up if the delta is too high
    delta = delta - step;
    activeRenderers = game.run(step, config, controls, sprites, map, player);
  }
  renderer.register(activeRenderers);
  renderer.drawFrame(activeRenderers, ctx, canvas, controls, game, map, player);
  last = now;                                   // time at the start of the previous loop
  requestAnimationFrame(frameLoop, canvas);

}
