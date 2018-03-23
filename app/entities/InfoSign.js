import Entity from './base/Entity';

/******************************************************************************/

export default class InfoSign extends Entity {

  constructor(props, tileSize, scale, sprites) {
    super(props, tileSize, scale, sprites);

    this.signType = props.type;
    this.info = props.info;

    this.opacity = 0;
    this.opacityStep = 1 / props.opacitySteps;
    this.isActive = false;
  }

  updateOpacity(opacitySteps) {
    const change = this.opacityStep * (this.isActive ? 1 : -1);
    this.opacity = Math.min(1, Math.max(0, this.opacity + change));
  }

  update(step) {
    this.updateOpacity();
  }

  checkInteraction(player) {
      this.isActive = this.collidesWith(player);
  }

  getSprite() {
    const signBoard = this.sprites.getSprite(['infoSigns', 'signs', this.signType]);
    if (!this.isActive && !this.opacity) return signBoard;

    const infoBubble = this.sprites.getSprite(['infoSigns', 'info', this.info]);
    infoBubble.opacity = this.opacity;
    infoBubble.drawOffsetX = -(infoBubble.width - signBoard.width) / 2;
    infoBubble.drawOffsetY = -infoBubble.height;

    return [signBoard, infoBubble];
  }

}
