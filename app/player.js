import AnimatedEntity from './entities/animatedEntity';

/******************************************************************************/

export default class Player extends AnimatedEntity {

  constructor(props, tileSize, scale, sprites) {
    super(props, tileSize, scale, sprites);
    this.initialProps = props;
  }

  /****************************************************************************/

  initialize(tileSize, scale) {

    const props = this.initialProps;

    this.position.x = props.initialPosition.x;
    this.position.y = props.initialPosition.y;

    this.movementParams = {  // Movement parameters
      vMax: {
        x: 350 * scale,
        y: 1100 * scale
      },
      midAirControl:  1,      // Caps horizontal vMax while in the air. Ranges from 0 (no horizontal velocity) to 1 (full horizontal velocity).
      acceleration:   0.05,   // Horizontal acceleration. Ranges from 0 (no acceleration) to 1 (instant acceleration)
      gravity:        3500 * scale,
      jumpForce:      100000 * scale,  // Instantaneous jump force
      pushForce:      55000 * scale,  // Instantaneous push force (when the player is pushed away sideways by an enemy)
      friction:       1500 * scale,   // Slows down any horizontal movement if the left/right key is not pressed.
    };

    // Movement vector
    this.motion = {
      x: 0,
      y: 0,
      step: 0
    };

    // Other state details
    this.is = {
      jumping: false,
      falling: false,
      onPlatform: false,
      facingRight: true,
      facingLeft: false,
      holdingKey: false,
      moving: false
    };

    this.canMove = true;

    this.dimensions.width = tileSize;
    this.dimensions.height = tileSize;
  }

  /****************************************************************************/


  update(step, controls, map) {
    this.motion.step = step;
    this.checkIfCanMove();
    this.move(step, controls);
    this.resolveMapColission(map);
    this.resolveEntityInteraction(map.entities);
  }

  /****************************************************************************/

  checkIfCanMove() {

  }

  /****************************************************************************/

  lockMovement() {

  }

  /****************************************************************************/

  getSprite() {

    let animation = 'walking_' + (this.is.facingRight ? 'right' : 'left');
    return this.getSpriteFrame('player', animation);

  /*  let currentSpriteType = function(is){
      if(!is.jumping && !is.falling && is.moving)   return 'walking';
      if(!is.jumping && !is.falling && !is.moving)  return 'standing';
      if(is.jumping)                                return 'jumping';
      if(is.falling)                                return 'falling';
      return 'standing';
    }(this.is) + '_' + (this.is.facingRight ? 'right' : 'left');*/
  }

  /*****************************************************************************
  |  Handles player actions, calculates player position, checks
  |  colissions with map tiles and map objects
  *****************************************************************************/

  move(step, controls) {

    // Update the vertical and horizontal vectors:
    this.motion.y = this.getNewVerticalVector(this.movementParams, this.motion.y, this.is, step, controls);
    this.motion.x = this.getNewHorizontalVector(this.movementParams, this.motion.x, this.is, step, controls);

    // [move this to the vector update function]
    this.is.moving = (this.motion.x !== 0);

    // Update the player position:
    this.position.offset(this.motion.x * step, this.motion.y * step);

    /*
    | If the player is standing in a platform, apply the platform offset.
    | (Note: <this.is.onPlatform> is either false or a reference to the
    | relevant platform object.)
    */
    /*if(this.is.onPlatform) {
      let offset = this.is.onPlatform.getOffset();  // This is how much the platform has moved during this cycle.
      this.position.x += offset.x;
      this.position.y += offset.y;
    }*/
  }

  /****************************************************************************/

  sendJumping() {
    this.motion.y -= this.movementParams.jumpForce * this.motion.step;
    this.is.jumping = true;
  }

  /****************************************************************************/

  pushLeft(flip = true) {
    this.motion.x = -this.movementParams.pushForce * this.motion.step;
  }

  /****************************************************************************/

  pushRight(flip = true) {
    this.motion.x = this.movementParams.pushForce * this.motion.step;
  }

  /****************************************************************************/


  getNewVerticalVector(params, y, is, step, controls) {
    // Perform jump unless the player's already mid-air:
    if(controls.jump && !is.jumping && !is.falling) {
      y -= params.jumpForce * step;
      is.jumping = true;
    }

    y = Math.min(params.vMax.y, y + (params.gravity * step)); // Apply gravity; cap velocity if it exceeds vMax.
    if(!controls.jump && (is.onPlatform)) y = 0;              // This one prevents vertical flickering while the player's standing on a platform.

    return y;
  }

  /****************************************************************************/

  getNewHorizontalVector(params, x, is, step, controls) {
    let wasGoingLeft  = x < 0;
    let wasGoingRight = x > 0;
    let vMax = is.jumping || is.falling ? params.vMax.x * params.midAirControl : params.vMax.x;

    // Right key is pressed:
    if(controls.right) {
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
    if(controls.left) {
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
    // change name to "solidTiles" or "isSolidTile"
    const tiles = map.getOverlappingTiles(x, y);

    const xOverlap = x%tileSize;         // Specifies if the player overlaps to the tile(s) on the right (NW, SW)
    const yOVerlap = y%tileSize;         // Specifies if the player overlaps to the tile(s) on the bottom (SE, SW)

    /*--------------------------------------------------------------------------
    | In some casese need to make sure that while falling, the player is actually
    | coming FROM ABOVE a tile (roughly). Otherwise, strange behaviour occurs
    | when approaching "ground" tiles from below.
    | It's not the cleanest code out there, admittedly...
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
        this.position.y = (Math.floor(this.position.y/tileSize))*tileSize;
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
        this.position.y = (Math.floor(this.position.y/tileSize)+1)*tileSize;
        tiles['NE'] = tiles['SE'];
        tiles['NW'] = tiles['SW'];
        overlapping.y = 0;
      }
    }
    // Player is moving right
    if (this.motion.x > 0 || this.is.onPlatform) {
      if ((tiles['NW'] && !tiles['NE']) ||
          (tiles['SW'] && !tiles['SE'] && overlapping.y)) {
        this.position.x = (Math.floor(this.position.x/tileSize))*tileSize;
        this.motion.x = 0;
      }
    }
    // Player is moving left
    if (this.motion.x < 0 || this.is.onPlatform) {
      if ((tiles['NE'] && !tiles['NW']) ||
          (tiles['SE'] && !tiles['SW'] && overlapping.y)) {
        this.position.x = (Math.floor(this.position.x/tileSize)+1)*tileSize;
        this.motion.x = 0;
      }
    }

    // Set the "falling" status if the bottom blocks are free
    //  if(!this.is.onPlatform) {
    let midAir = !(tiles['SE'] || (overlapping.x && tiles['SW']));
    if(midAir && this.motion.y > 0) {
      this.is.jumping = false;
      this.is.falling = true;
    }
    //  }
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
    entities.platforms.some(this.resolvePlatformInteraction.bind(this));
    // TODO: Handle other types of entities.
  }

  /*****************************************************************************
  | Checks if the player is standing on a moving platform; and if necessary,
  | also modifies the player's position.
  *****************************************************************************/
  resolvePlatformInteraction(platform) {

    this.is.onPlatform = false;
    const falling = this.is.falling,
          jumping = this.is.jumping;

    if (platform.collidesWith(this)) {

      // Falling on top of the platform:
      if (falling) {
        this.position.y = platform.y - this.height;
        this.is.jumping = this.is.falling = false;
      }
      // Hitting the platform from below:
      else if (jumping) {
        this.position.y = platform.y + platform.height;
        this.is.falling = true;
      }

      this.motion.y = 0;
      this.is.onPlatform = true;
    }

    else if(platform.isDirectlyUnder(this)) {
      this.motion.y = 0;
      this.is.jumping = this.is.falling = false;
      this.position.y = platform.y - this.height;
      this.is.onPlatform = true;
    }

    /* If the platform slides horizontally, offset the player's position
       by how much the platform has moved in this cycle.                      */
    if (this.is.onPlatform) {
      const offset = platform.getOffset();
      this.position.x += offset.x;
      this.position.y += offset.y;
    }

    return this.is.onPlatform; // If true, the interaction check loop will break.
  }

/******************************************************************************/

}
