export function fadeOut(duration) {

  const step = 1/duration;
  let opacity = 0;

  return function() {
    opacity += step;
    if (opacity > 1) opacity = 1;
    return opacity;
  };
}

export function fadeIn(duration) {

  const opacity = fadeOut(duration);

  return function() {
    return 1 - opacity();
  };
}



/*----------------------------------------------------------------------------*/
/**
 *
 */
export function circleOut(ctx, width, height, overlay, steps) {

  const cornerToCenter = Math.sqrt( Math.pow((width), 2) + Math.pow((height), 2) ) / 2; // Max. radius
  const startingRadius = 0,
        targetRadius = cornerToCenter;

  return circleInOut.apply(null, [...arguments, 0, cornerToCenter]);
}

/*----------------------------------------------------------------------------*/
/**
 *
 */
function circleInOut(ctx, width, height, overlay, steps, startingRadius, targetRadius) {

  const getRadius = stepFromTo(startingRadius, targetRadius, steps);

  return function() {
    const radius = getRadius();
    const animationIsFinished = radius === targetRadius;

      drawHole(ctx, width, height, radius, overlay);

    if(animationIsFinished) return true;
  };
}

/*----------------------------------------------------------------------------*/
/**
 *
 */
function drawHole(ctx, width, height, radius, overlay) {
    ctx.save();

    // Plot the circle path inside:
    ctx.beginPath();
    ctx.arc(width/2, height/2, radius, 0, Math.PI*2, false);
    ctx.closePath();

    // Plot the square path outside:
    ctx.moveTo(0,0);
    ctx.lineTo(0, height);
    ctx.lineTo(width,height);
    ctx.lineTo(width,0);
    ctx.closePath();

    ctx.clip();

    ctx.fillStyle = overlay;
    ctx.fillRect(0, 0, width, height);

    ctx.restore();
}

/*----------------------------------------------------------------------------*/
/**
 *
 */
function drawOverlay(ctx, overlay) {


}

/*----------------------------------------------------------------------------*/
/**
 * @param  {number} start             initial value
 * @param  {number} end               end value
 * @param  {number} steps             number of steps to achieve the end value
 * @param  {number} accelleration = 1 acceleration factor for the increase step
 * @return {number}                   current value
 */
function stepFromTo(start, end, steps, accelleration = 1) {
  let current = start;
  let step = ((end - start) / steps);

  return function() {
    step = step * accelleration;
    current += step;

    if (start < end && current > end
    ||  start > end && current < end) {
      current = end;
    }

    return current;
  };
}
