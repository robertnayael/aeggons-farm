import LinearlyMovingEntity from './entities/LinearlyMovingEntity';

export default class Mob extends LinearlyMovingEntity {

  constructor(props, tileSize) {
    super(props, tileSize);
  }

  update(step) {
    this.moveAlong(step);

  }

}
