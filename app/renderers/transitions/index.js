/*----------------------------------------------------------------------------*/

export function fadeIn(ctx, width, height, overlay, steps) {

  const opacity = {
    initial: 0,
    target: 1
  };
  return fadeInOut(...arguments, opacity);

}

/*----------------------------------------------------------------------------*/

export function fadeOut(ctx, width, height, overlay, steps) {

  const opacity = {
    initial: 1,
    target: 0
  };
  return fadeInOut(...arguments, opacity);

}

/*----------------------------------------------------------------------------*/

export function circleIn(steps, content, canvas) {

  const radius = {
    initial: Math.sqrt( Math.pow((canvas.width), 2) + Math.pow((canvas.height), 2) ) / 2, // Corner to center
    target: 0
  };
  return circleInOut(...arguments, radius);

}

/*----------------------------------------------------------------------------*/
/**
 * @param  {number} steps                        - number of steps (frames) the effect should take until completed
 * @param  {Object} content                      - content to draw on the canvas
 * @param  {string} content.type                 - identifier of the content type
 * @param  {string|function} content.payload     - hex color, or a function returning a sprite
 * @param  {Object} canvas                       - basic canvas properties
 * @param  {number} canvas.width                 - canvas width
 * @param  {number} canvas.height                - canvas height
 * @param  {CanvasRenderingContext2D} canvas.ctx - canvas context handler
 * @return {function}                            - function that executes the transition effect by one step on each call
 */
export function circleOut(steps, content, canvas) {

  const radius = {
    initial: 0,
    target: Math.sqrt( Math.pow((canvas.width), 2) + Math.pow((canvas.height), 2) ) / 2 // Corner to center
  };
  return circleInOut(...arguments, radius);

}

/*----------------------------------------------------------------------------*/

function circleInOut(steps, content, canvas, radius) {

  const getRadius = stepFromTo(radius.initial, radius.target, steps);

  return function() {
    const currentRadius = getRadius();
    const animationIsFinished = currentRadius === radius.target;

    drawHole(content, canvas, currentRadius);

    if(animationIsFinished) return true;
    return false;
  };
}

/*----------------------------------------------------------------------------*/

function fadeInOut(steps, content, canvas, opacity) {
  const getOpacity = stepFromTo(opacity.initial, opacity.target, steps);

  return function() {
    const currentOpacity = getOpacity();
    const animationIsFinished = currentOpacity === opacity.target;

    canvas.ctx.globalAlpha = currentOpacity;
    drawContent(content, canvas);
    canvas.ctx.globalAlpha = 1;

    if(animationIsFinished) return true;
    return false;
  };
}

/*----------------------------------------------------------------------------*/

function drawHole(content, canvas, radius) {

  const {width, height, ctx} = canvas;

    ctx.save();

    // Plot the circle path inside:
    ctx.beginPath();
    ctx.arc(width/2, height/2, radius, 0, Math.PI*2, false);
    ctx.closePath();

    // Plot the square path outside:
    ctx.moveTo(0,0);
    ctx.lineTo(0, height);
    ctx.lineTo(width, height);
    ctx.lineTo(width,0);
    ctx.closePath();

    ctx.clip();

    // Draw content:

    drawContent(content, canvas);

    ctx.restore();
}

/*----------------------------------------------------------------------------*/

function drawContent(content, canvas) {

  switch(content.type) {
    case 'SOLID_COLOR': colorFill(content.color, canvas); break;
    case 'SPRITE':      drawSprite(content.sprite, content.position, canvas); break;
    case 'ANIMATION':   drawSprite(content.frameIterator.next().value, content.position, canvas); break;
  }

}

/*----------------------------------------------------------------------------*/

function drawSprite(sprite, position, canvas) {

  canvas.ctx.drawImage(
    sprite.image,
    sprite.x, sprite.y,
    sprite.width, sprite.height,
    getAbsoluteDist(position[0], canvas.width, sprite.width), getAbsoluteDist(position[1], canvas.height, sprite.height),
    sprite.width, sprite.height);

}

/*----------------------------------------------------------------------------*/

function getAbsoluteDist(relativeDist, totalDist, elementSize) {

  if (relativeDist === 'center') {
    return Math.round((totalDist - elementSize) / 2);
  }

  return relativeDist * totalDist;

}

/*----------------------------------------------------------------------------*/

function colorFill(color, {width, height, ctx}) {
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, width, height);
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

/*----------------------------------------------------------------------------*/
