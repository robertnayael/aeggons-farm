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

export function circleOut(duration, targetRadius) {

  let step = targetRadius/duration;
  const accelleration = 1.02;
  let radius = 0;

  return function() {
    step = step * accelleration;
    radius += step;
    if (radius > targetRadius) radius = targetRadius;
    return radius;
  };
}
