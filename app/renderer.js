export function Renderer () {

  // Each property reflects the state of the respective rendering method (true: enabled, false: disabled).
  let rendererState = {
    welcomeScreen: false,
    gameplay: false,
    debugOverlay: true,
    gameplayIntro: false,
    awaitingRespawnOverlay: false,
    gameOverOverlay: false,
    gameWonOverlay: false,
  };
  const renderers = {}; // This stores all the rendering methods (declared later on)

  /*****************************************************************************
  |  Toggles the specified renderer enabled
  */
  this.enable = function(type) {
    if(rendererState[type] === false)
      rendererState[type] = true;
  };

  /*****************************************************************************
  |  Toggles the specified renderer/all renderers  disabled
  */
  this.disable = function(type) {
    if(rendererState[type] === true)
      rendererState[type] = false;

    // No arguments passed: disable all renderers (but not the debug overlay)
    if(type === undefined) {
      for (let property in rendererState) {
        if (rendererState.hasOwnProperty(property) && property !== 'debugOverlay') {
          rendererState[property] = false;
        }
      }
    }
  };

  /*****************************************************************************
  | Fires all active renderers. This method is called on each cycle
  | from within the frame loop.
  */
  this.drawFrame = function(activeRenderers, ctx, canvas, controls, game, map, player) {

    // Clear the whole canvas:
    ctx.clearRect(0, 0, canvas.width, canvas.height);

  /*  for (let type in rendererState) {
      if (rendererState.hasOwnProperty(type) && rendererState[type] === true) {
        renderers[type](ctx, controls, game, map, player);
      }
    }
*/

    activeRenderers.forEach(renderer => renderers[renderer](ctx, controls, game, map, player))
  };

  /*****************************************************************************
  | The welcome screen, displayed before a new game starts.
  */
  renderers.welcomeScreen = function(ctx) {

  };

  /*****************************************************************************
  | This overlay is drawn on top of the game while the player is waiting to be
  | respawned after losing a life.
  */
  renderers.awaitingRespawnOverlay = function(ctx) {

  };

  /*****************************************************************************
  |
  */
  renderers.gameOverOverlay = function(ctx) {

  };

  /*****************************************************************************
  | Draws the screen displayed before a new game starts.
  */
  renderers.gameWonOverlay = function(ctx) {

  };

  /*****************************************************************************
  | Draws the screen displayed before a new game starts.
  */
  renderers.gameplayIntro = function(ctx) {

  };

  /*****************************************************************************
  | Draws the current frame while the gameplay is running.
  */
  renderers.gameplay = function(ctx, controls, game, map, player) {

    const offset = map.getOffset(player);

const TILE_SIZE = 70;

    for(let y = 0; y < map.height.tiles; y++) {
      for(let x = 0; x < map.width.tiles; x++) {
        let tile = map.getTileNumber(x, y);
        ctx.fillStyle = tile ? '#B87C28' : '#92FAFF';
      //  if (isInRange(offset.map, {x: x * TILE_SIZE, y: y * TILE_SIZE, width: TILE_SIZE, height: TILE_SIZE}))
          ctx.fillRect(x * TILE_SIZE - offset.map.x - 1, y * TILE_SIZE - offset.map.y -1, TILE_SIZE + 2, TILE_SIZE +2);
      }
    }

    ctx.fillStyle = '#7D007D';
    map.entities.platforms.forEach(platform => {
      ctx.fillRect(platform.x - offset.map.x, platform.y - offset.map.y, platform.width, platform.height);
    });

  /*  var img=document.getElementById("chicken");
    ctx.drawImage(img, player.getSprite(), 0, 175, 158,
                     offset.player.x - 54, offset.player.y - 80, 175, 158);
*/




    this._drawMapLayer(ctx, 0, offset.map, map);
    this._drawEntities(ctx, 'platforms', offset.map);
    this._drawPlayer(ctx, offset.player, player);
    this._drawOSD(ctx);

  //  ctx.strokeRect(offset.player.x, offset.player.y, TILE_SIZE, TILE_SIZE);

  };

  /*****************************************************************************
  |
  */

  renderers._drawMapLayer = function(ctx, layer, offset, map) {
    map.tiles.inRange.forEach(tile => {
    //  let sprite = map.getTileSprite(tile, 0);
    });
  };

  /*****************************************************************************
  |
  */

  renderers._drawEntities = function(ctx, type, offset) {

  //  ctx.drawImage(img, player.getSprite(), 0, 175, 158,
  //                   offset.player.x - 54, offset.player.y - 80, 175, 158);
  };

  /*****************************************************************************
  |
  */

  renderers._drawPlayer = function(ctx, offset, player) {
    //player.getSprite();
    const sprite = player.getSprite();
    ctx.drawImage(
      sprite.image,
      sprite.x, sprite.y,
      sprite.width, sprite.height,
      offset.x + sprite.drawOffsetX, offset.y + sprite.drawOffsetY,
      sprite.width, sprite.height);
  };

  /*****************************************************************************
  |
  */

  renderers._drawOSD = function(ctx) {

  };

  /*****************************************************************************
  |
  */

  renderers.gameplayMapLayer = function() {

  }

  /*****************************************************************************
  | Draws tile boundaries and some under-the-hood details on top of the canvas.
  */
  renderers.debugOverlay = function(ctx, controls, game, map, player) {

    ctx.font = "30px Arial";
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'red';
    ctx.strokeText(`State: [${game.state}]`, 10, 30);
    //ctx.strokeText(`[ ]`, 10, 70);

  };

  /*****************************************************************************
  |
  */
  function isInRange (offset, object) {

    return (function(viewport, offset, object) {

      // Drawing range, calculated from the viewport center. Let's make it lightly larger than 1/2 of the viewport, just to be safe.
      let range = {
        horizontal: viewport.width/2 + TILE_SIZE,
        vertical: viewport.height/2 + TILE_SIZE
      };

      // Absolute coords of the viewport center
      let center = {
        x: (offset.x + viewport.width/2),
        y: (offset.y + viewport.height/2)
      };

      // Horizontal/vertical distance of each object edge from the viewport center
      let distance = {
        left: (center.x) - (object.x + object.width),
        right: (object.x) - (center.x),
        top: (center.y) - (object.y + object.height),
        bottom: (object.y) - (center.y)
      }

      // Returns false if any distance exceeds the respective range, true otherwise
      return !(
        distance.left > range.horizontal
        || distance.right > range.horizontal
        || distance.top > range.vertical
        || distance.bottom > range.vertical
      );
    })(
      {width: VIEWPORT_WIDTH * TILE_SIZE, height: VIEWPORT_HEIGHT * TILE_SIZE},
      offset,
      object
    )
  };

  /*****************************************************************************
  | Calculates:
  | 1) the map offset (relative to the absolute [0,0]), so that all map objects
  |    can be drawn relative to the player's position;
  | 2) the player offset (relative to the viewport center), which occurs if the
  |    player happens to be too close to a map edge.
  */
  function getOffset() {

    return (function(viewport, player, map) {

      let playerOffcenterLeft = Math.min(0, player.x - viewport.width/2),
          playerOffcenterRight = Math.max( 0, (player.x + viewport.width/2) - map.width),
          playerOffcenterX = playerOffcenterLeft + playerOffcenterRight;

      let playerOffcenterTop = Math.min(0, player.y - viewport.height/2),
          playerOffcenterBottom = Math.max( 0, (player.y + viewport.height/2) - map.height),
          playerOffcenterY = playerOffcenterTop + playerOffcenterBottom;

      return {
        map: {
          x: (player.x - viewport.width/2) - playerOffcenterX,
          y: (player.y - viewport.height/2) - playerOffcenterY
        },
        player: {
          x: viewport.width/2 + playerOffcenterX,
          y: viewport.height/2 + playerOffcenterY
        }
      };

    })(
      {width: VIEWPORT_WIDTH * TILE_SIZE, height: VIEWPORT_HEIGHT * TILE_SIZE},
      {x: player.position.x, y: player.position.y},
      {width: map.width.px, height: map.height.px}
    );

  };
}
