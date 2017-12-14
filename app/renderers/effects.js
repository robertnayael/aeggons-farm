export function fadeOut(duration) {

  const step = 1/duration;
  let opacity = 0;
  let count = 0;

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
