import AnimatedEntity from './AnimatedEntity';

export default class LinearlyMovingEntity extends AnimatedEntity {

  constructor(props, tileSize, scale, sprites) {
    super(props, tileSize, scale, sprites);

    this.position.x = props.initialPosition.x * tileSize;
    this.position.y = props.initialPosition.y * tileSize;

    this.position.initial = {
      x: props.initialPosition.x * tileSize,
      y: props.initialPosition.y * tileSize
    };

    this.position.final = {};
    if(props.finalPosition.x) this.position.final.x = props.finalPosition.x * tileSize;
    if(props.finalPosition.y) this.position.final.y = props.finalPosition.y * tileSize;

    this.speed = props.speed * tileSize;
  }

  moveAlong(step) {

    const axis = this.getMovementAxis();
    const start = this.position.initial[axis];
    const end = this.position.final[axis];
    const current = this.position[axis];
    const previous = this.position.previous[axis];
    const speed  = this.speed;

    // This will be oru new position; start with the current one:
    let newPos = current;

    // Determine the direction (left/up: -1; right/down: +1)
    let direction = previous !== null
      ? Math.sign(current - previous)
      : Math.sign(end - start);       // No previous position is stored; determine the direction based on the starting and target positions of the entity

    // Reverse the direction if the starting or target position has been reached:
    if(previous !== null && (current === start || current === end))
      direction = direction < 0 ? 1 : -1;

    // Calculate the new position:
    newPos = current + direction * (speed * step);

    // If necessary, clamp the position so the entity doesn's exceed the starting or target position:
    newPos = this.clampExtremePosition(newPos, start, end);

    // Store the previous position and update the current position:
    this.position.previous[axis] = this.position[axis];
    this.position[axis] = newPos;

    this.updateEdges();
  }

  getMovementDirection() {

  }

  clampExtremePosition(position, start, end) {

    let clampedPos = position;

    if(end - start > 0) {  // this is for entities with a starting position that is higher/more to the left than the target position
      clampedPos = (position > end) ? end : clampedPos;
      clampedPos = (position < start) ? start : clampedPos;
    }
    else {                 // ... and the other way around
      clampedPos = (position < end) ? end : clampedPos;
      clampedPos = (position > start) ? start : clampedPos;
    }

    return clampedPos;
  }

  getMovementAxis() {
    if('x' in this.position.final) return 'x';
    if('y' in this.position.final) return 'y';
    return false;
  }

}
