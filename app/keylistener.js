const KEYCODES = {SPACE: 32, LEFT: 37, UP: 38, RIGHT: 39, DOWN: 40, ENTER: 13, ESCAPE: 27, TILDE: 192};

export function onkey(event, key, isDown, controls) {
  switch(key) {
    case KEYCODES.LEFT:   controls.left   = isDown; return false;
    case KEYCODES.RIGHT:  controls.right  = isDown; return false;
    case KEYCODES.SPACE:  controls.jump   = isDown; return false;
    case KEYCODES.UP:     controls.jump   = isDown; return false;
    case KEYCODES.ENTER:  controls.accept = isDown; return false;
    case KEYCODES.ESCAPE: controls.exit   = isDown; return false;
    case KEYCODES.TILDE:  controls.debug  = isDown; return false;
  }
};
