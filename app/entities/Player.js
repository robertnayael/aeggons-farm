import AnimatedEntity from './base/AnimatedEntity';

/******************************************************************************/

export default class Player extends AnimatedEntity {

  constructor({config, tileSize, scale, sprites, updateScore, victoryConditionsMet}) {
    super(config, tileSize, scale, sprites);
    this.initialProps = config;
    this.updateScore = updateScore;
    this.victoryConditionsMet = victoryConditionsMet;
  }

  /****************************************************************************/

  initialize({tileSize, scale, initialPos}) {

    const props = this.initialProps;
    const movementParams = props.movementParams;

    this.lives = props.lives;

    this.invulnerabilityOnHit = props.invulnerabilityOnHit;
    this.opacityPulsingOnHit = props.opacityPulsingOnHit;
    this.opacityPulser = this.getOpacityPulser(this.opacityPulsingOnHit);

    this.position.x = initialPos.x * tileSize;
    this.position.y = initialPos.y * tileSize;

    this.movementParams = {  // Movement parameters
      vMax: {
        x: movementParams.vMax.x * scale,
        y: movementParams.vMax.y * scale
      },
      midAirControl:  movementParams.midAirControl,
      acceleration:   movementParams.acceleration,
      gravity:        movementParams.gravity * scale,
      jumpForce:      movementParams.jumpForce * scale,
      pushForce:      movementParams.pushForce * scale,
      friction:       movementParams.friction * scale,
    };

    // Movement vector
    this.motion = {
      x: 0,
      y: 0,
      step: 0,
      previous: {}
    };

    // Other state details
    this.is = {
      jumping: false,
      falling: false,
      onPlatform: false,
      facingRight: true,
      facingLeft: false,
      moving: false,
      hit: false,
      dead: false
    };

    this.canMove = true;

    this.dimensions.width = tileSize;
    this.dimensions.height = tileSize;

    this.updateEdges();
  }

  /****************************************************************************/


  update({step, controls, map, controlsLocked}) {
    this.nextGameState = null;
    const wasFalling = this.is.falling;

    this.motion.step = step;
    this.checkIfCanMove();
    this.move(step, controls, controlsLocked);
    this.resolveMapColission(map);
    this.resolveEntityInteraction(map.entities);

    if (wasFalling && !this.is.falling) this.bounce();

    this.storeMotionVectors();

    return this.nextGameState;
  }

  /****************************************************************************/

  storeMotionVectors() {
    this.motion.previous = {
      x: this.motion.x,
      y: this.motion.y
    };
  }

  /****************************************************************************/

  bounce() {
  /*  if (this.motion.previous.y >= this.movementParams.vMax.y) {
      this.sendJumping(0.2);
    }
  */
  }

  /****************************************************************************/

  checkIfCanMove() {

  }

  /****************************************************************************/

  lockMovement() {

  }

  /****************************************************************************/

  getSprite() {

    const type = this.getSpriteType(this.is);

    let sprite = this.getSpriteFrame(['player', type]);
    if (this.is.hit) {
      sprite.opacity = this.opacityPulser.next().value;
    }

    return sprite;
  }

  /****************************************************************************/

  getSpriteType(is) {

      if (is.dead) return "dead";

      const type = function(is){
      /*  if(!is.jumping && !is.falling && is.moving)   return 'walking';
        if(!is.jumping && !is.falling && !is.moving)  return 'standing';
        if(is.jumping)                                return 'jumping';
        if(is.falling)                                return 'falling';*/
        if(is.moving && !is.jumping && !is.falling) return 'walking';
        /* default */ return 'standing';
        return 'standing';
      }(is) + '_' + (is.facingRight ? 'right' : 'left');

      return type;
  }

  /****************************************************************************/

  *getOpacityPulser(frames) {
    let index = 0;
    while (index < frames.length) {
      let i = index;
      index++;
      if (index === frames.length) index = 0;
      yield frames[i];
    }
  }

  /*****************************************************************************
  |  Handles player actions, calculates player position, checks
  |  colissions with map tiles and map objects
  *****************************************************************************/

  move(step, controls, controlsLocked) {

    // Update the vertical and horizontal vectors:
    this.motion.y = this.getNewVerticalVector(this.movementParams, this.motion.y, this.is, step, controls, controlsLocked);
    this.motion.x = this.getNewHorizontalVector(this.movementParams, this.motion.x, this.is, step, controls, controlsLocked);

    // [move this to the vector update function]
    this.is.moving = (this.motion.x !== 0);

    // Update the player position:
    this.moveBy(this.motion.x * step, this.motion.y * step);
  }

  /****************************************************************************/

  sendJumping(forceFactor = 1) {
    this.motion.y = 0 - (this.movementParams.jumpForce * forceFactor) * this.motion.step;
    this.is.jumping = true;
  }

  /****************************************************************************/

  pushAway() {
    if (this.is.facingRight) this.pushLeft();
    else this.pushRight();
  }

  /****************************************************************************/

  pushLeft() {
    this.motion.x = -this.movementParams.pushForce * this.motion.step;
  }

  /****************************************************************************/

  pushRight() {
    this.motion.x = this.movementParams.pushForce * this.motion.step;
  }

  /****************************************************************************/

  gotHit() {
    this.lives--;
    this.is.hit = true;
    this.nextGameState = 'playerGotHit';
    this.updateScore();
    this.opacityPulser = this.getOpacityPulser(this.opacityPulsingOnHit);
    setTimeout(this.recuperateAfterHit.bind(this), this.invulnerabilityOnHit);

    if (this.lives <= 0) this.die();

    this.startEffect(['player', 'effect_hit'], true);
  }

  /****************************************************************************/

  recuperateAfterHit() {
    this.is.hit = false;
  }

  /****************************************************************************/

  die() {
    this.nextGameState = 'gameOver';
    this.is.dead = true;
    this.is.hit = false;
  }

  /****************************************************************************/

  finishGame() {
    if (!this.is.dead && this.victoryConditionsMet()) this.nextGameState = 'gameWon';
  }

  /****************************************************************************/

  getNewVerticalVector(params, y, is, step, controls, controlsLocked) {
    // Perform jump unless the player's already mid-air:
    if(!controlsLocked && controls && controls.jump && !is.jumping && !is.falling && !is.dead) {
      y -= params.jumpForce * step;
      is.jumping = true;
    }

    y = Math.min(params.vMax.y, y + (params.gravity * step)); // Apply gravity; cap velocity if it exceeds vMax.
    if(!controls.jump && (is.onPlatform) && y > 0) y = 0;              // This one prevents vertical flickering while the player's standing on a platform.

    return y;
  }

  /****************************************************************************/

  getNewHorizontalVector(params, x, is, step, controls, controlsLocked) {
    let wasGoingLeft  = x < 0;
    let wasGoingRight = x > 0;
    let vMax = is.jumping || is.falling ? params.vMax.x * params.midAirControl : params.vMax.x;

    // Right key is pressed:
    if(!controlsLocked && controls.right && !is.dead) {
      x += params.acceleration * vMax + (1 - params.acceleration) * x * step;
      x = Math.min(x, vMax);  // Cap at vMax, if necessary.

      is.facingRight = true;
      is.facingLeft = false;
    }

    // Right key is not pressed, but the player is still moving right
    else if (wasGoingRight) {
      x -= params.friction * step;
      x = Math.max(x, 0);     // Cap at 0, if necessary. (It's highly possible that after applying friction, the new value will be overshot.)
    }

    // Left key is pressed:
    if(!controlsLocked && controls.left && !is.dead) {
      x -= params.acceleration * vMax + (1 - params.acceleration) * x * step;
      x = Math.max(x, -vMax);

      is.facingLeft = true;
      is.facingRight = false;
    }

    // Left key is not pressed, but the player is still moving left
    else if (wasGoingLeft) {
      x += params.friction * step;
      x = Math.min(x, 0);
    }

    return x;
  }

  /*****************************************************************************
  |  Checks and resolves colissions with map tiles and map objects. Colission
  |  detection is a simple one: it checks the four tiles that the player can
  |  overlap with (note that the player is exactly one tile wide and long).
  |
  |  If any of these four tiles are "solid" (i.e. they are marked as restricted
  |  on the tile map), the player's movement in the corresponding direction is
  |  stopped. If necessary the position is then "clamped" back to
  |  an unrestricted tile, so that the player doesn't end up in the middle of
  |  a solid tile.
  |                                        ______                 _____________
  |                                       |      |               |      |      |
  |                                       |Player|               |  NE  |  NW  |
  |                                       |______|               |______|______|
  |                                                              |      |      |
  |                                The player tile can collide   |  SE  |  SW  |
  |                                with any of the four tiles:   |______|______|
  |
  *****************************************************************************/
  resolveMapColission(map) {

    let x = this.position.x,
        y = this.position.y;
    const tileSize = map.tileSize;
    const overlapping = {
      x: x%tileSize,
      y: y%tileSize
    };
    // TODO: change name to "solidTiles" or "isSolidTile", or another meaningful name.
    const tiles = map.getOverlappingTiles(x, y);

    const xOverlap = x%tileSize;         // Specifies if the player overlaps to the tile(s) on the right (NW, SW)
    const yOVerlap = y%tileSize;         // Specifies if the player overlaps to the tile(s) on the bottom (SE, SW)

    /*--------------------------------------------------------------------------
    | In some casese need to make sure that while falling, the player is actually
    | coming FROM ABOVE a tile (more or less). Otherwise, strange behaviour occurs
    | when approaching "solid" tiles from below.
    | There doesn't seem to be a cleaner solution given this
    | colission detection algorithm.
    | 1) Calculate the player's top position, padded to the nearest tile;
    | 2) Determine if the player's bottom edge is not lower than 1/4 of the tile below.
    */
    const playerTop = (Math.floor(this.position.y / tileSize) + 1) * tileSize;
    const notFromBelow = this.position.previous.y + tileSize <= playerTop + tileSize / 4;

    /*--------------------------------------------------------------------------
    |  Player is falling: check if the tiles below are solid. If so:
    |  1) stop the downward movement,
    |  2) align the player's vertical position so that the character's bottom edge
    |  is exactly above the top edge of the blocking tile,
    |  3) cancel the "falling" status (and "jumping" too, just to be safe).
    */
    if (this.motion.y > 0) {
      if ((tiles['SE'] && !tiles['NE'] && notFromBelow) ||
          (tiles['SW'] && !tiles['NW'] && overlapping.x && notFromBelow)) {
        this.motion.y = 0;
        y = Math.floor(y / tileSize) * tileSize;
        this.is.falling = false;
        this.is.jumping = false;
        overlapping.y = 0;
      }
    }
    // Player is jumping.
    else if (this.motion.y < 0) {
      if ((tiles['NE'] && !tiles['SE']) ||
          (tiles['NW'] && !tiles['SW'] && overlapping.x)) {
        this.motion.y = 0;
        y = (Math.floor(y / tileSize) + 1) * tileSize;
        tiles['NE'] = tiles['SE'];
        tiles['NW'] = tiles['SW'];
        overlapping.y = 0;
      }
    }
    // Player is moving right
    if (this.motion.x > 0 || this.is.onPlatform) {
      if ((tiles['NW'] && !tiles['NE']) ||
          (tiles['SW'] && !tiles['SE'] && overlapping.y)) {
        x = (Math.floor(x / tileSize)) * tileSize;
        this.motion.x = 0;
      }
    }
    // Player is moving left
    if (this.motion.x < 0 || this.is.onPlatform) {
      if ((tiles['NE'] && !tiles['NW']) ||
          (tiles['SE'] && !tiles['SW'] && overlapping.y)) {
        x = (Math.floor(x / tileSize) + 1) * tileSize;
        this.motion.x = 0;
      }
    }

    // Set the "falling" status if the bottom blocks are free
    const midAir = !(tiles['SE'] || (overlapping.x && tiles['SW']));
    if(midAir && this.motion.y > 0) {
      this.is.jumping = false;
      this.is.falling = true;
    }

    this.moveTo(x, y);
  }

  /*****************************************************************************
  | Cycles through all entities (platforms, mobs, spikes, collectibles) in the
  | viewing range and triggers the corresponding method to resolve resolve
  | interaction with the player.
  | Note that with "Array.prototype.some" the check loop will break once
  | interaction is identified.
  | TODO: Only entities close to the player (say, within 1 tile) could
  | be checked, instead of all the entities in the viewing range.
  *****************************************************************************/
  resolveEntityInteraction(entities) {

    if (!this.isStillOnLastPlatform()) {
      entities.platforms.some(this.resolvePlatformInteraction.bind(this));
    }

    if (!this.is.dead) {
      entities.mobs.some(this.resolveStandardInteraction.bind(this));
      entities.spikes.some(this.resolveStandardInteraction.bind(this));
      entities.collectibles.some(this.resolveStandardInteraction.bind(this));
      entities.infoSigns.some(this.resolveStandardInteraction.bind(this));
      entities.specialObjects.some(this.resolveStandardInteraction.bind(this));
    }
  }

  /*****************************************************************************
  | Checks if the player is still standing on the last platform (the one from
  | the previous frame). If so, offset the player's position by how much the
  | platform has already moved during the current cycle and return true.
  *****************************************************************************/

  isStillOnLastPlatform() {

    if (!this.is.onPlatform) return false;

    const platform = this.currentPlatform; // Reference to the last platform the player was standing on
    this.moveBy(platform.getOffset().x, platform.getOffset().y);

    if (platform.isDirectlyUnder(this)) {
      return true;
    }
    else {
      this.is.onPlatform = false;
      this.currentPlatform = null;
      return false;
    }
  }

  /*****************************************************************************
  | Checks if the player is standing on a moving platform. If so, stores
  | a reference to the platform and also modifies the player's position.
  *****************************************************************************/

  resolvePlatformInteraction(platform) {

    if (platform.collidesWith(this)) {

      // Falling on top of the platform.
      if (this.is.falling && this.bottom < platform.bottom) {
        this.is.onPlatform = true;
        this.currentPlatform = platform;
      }
      // Hitting the platform from below:
      else if (this.is.jumping && this.top > platform.top) {
        this.moveTo(this.x, platform.y + platform.height);
        this.is.jumping = false;
        this.is.falling = true;
        this.motion.y = 0;
      }

    }
    else if (platform.isDirectlyUnder(this)) {
      this.is.onPlatform = true;
      this.currentPlatform = platform;
    }

    if (this.currentPlatform === platform) {
      this.moveTo(this.x, platform.y - this.height);   // Offset the player's vertical position to match the platform.
      this.motion.y = 0;
      this.is.jumping = this.is.falling = false;
      return true;                                // A truish value will break the parent loop.
    }

  }

/******************************************************************************/

  resolveStandardInteraction(entity) {
    const interaction = this.checkInteraction(entity);
    if (!interaction) return false;
    this.applyInteraction(interaction);
    return true;
  }

  checkInteraction(entity) {
    return entity.checkInteraction(
      {
        isInvulnerable: this.is.hit,
        isFalling: this.is.falling,
        top: this.top,
        left: this.left,
        right: this.right,
        x: this.x,
        y: this.y,
        width: this.width,
        height: this.height
      }
    );
  }

  applyInteraction(actions) {
    actions.forEach(action => {
      switch (action) {
        case 'SEND_JUMPING': this.sendJumping(0.75); break;
        case 'SEND_JUMPING_HIGH': this.sendJumping(1); break;
        case 'SEND_JUMPING_LOW': this.sendJumping(0.5); break;
        case 'PUSH_AWAY': this.pushAway(); break;
        case 'HIT': this.gotHit(); break;
        case 'COLLECTIBLE_COLLECTED': this.updateScore(); break;
        case 'REACH_FINISH': this.finishGame(); break;
        default: break;
      }
    });
  }

/******************************************************************************/

}
