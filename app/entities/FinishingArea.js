import Entity from './base/Entity';

/******************************************************************************/

export default class FinishingArea extends Entity {

    constructor(props, tileSize, scale, sprites, victoryConditionsMet) {
        super(props, tileSize, scale, sprites);

        this.victoryConditionsMet = victoryConditionsMet;

        this.infoSprite = {
            opacity: 0,
            opacityStep: 1 / props.opacitySteps,
            isActive: false
        };
    }

    update(step) {
        this.updateOpacity();
    }

    updateOpacity(opacitySteps) {
        const change = this.infoSprite.opacityStep * (this.infoSprite.isActive ? 1 : -1);
        this.infoSprite.opacity = Math.min(1, Math.max(0, this.infoSprite.opacity + change));
    }

    checkInteraction(player) {
        const collidesWithPlayer = this.collidesWith(player);

        if (!this.victoryConditionsMet()) this.infoSprite.isActive = collidesWithPlayer;

        if (collidesWithPlayer) return this.playerActions();
    }

    playerActions() {
        return ['REACH_FINISH'];
    }

    getSprite() {
        if (!this.infoSprite.isActive && !this.infoSprite.opacity) return;
        const infoBubble = this.sprites.getSprite(['specialObjects', 'finishAreaReached']);
        infoBubble.opacity = this.infoSprite.opacity;
        infoBubble.drawOffsetX = -(infoBubble.width - this.width) / 2;
        infoBubble.drawOffsetY = -infoBubble.height;
    
        return infoBubble;
      }

}