export function Renderer (config) {

  // Each property reflects the state of the respective rendering method (true: enabled, false: disabled).
  let rendererState = {
    welcomeScreen: false,
    gameplay: false,
    debugOverlay: true,
    gameplayIntro: false,
    playerGotHitOverlay: false,
    gameOverOverlay: false,
    gameWonOverlay: false,
  };
  const renderers = {}; // This stores all the rendering methods (declared later on)

  const tileSize = config.tileSize;
  const scale = config.scale;

  /*****************************************************************************
  |
  */
  this.register = function(activeRenderers) {

    // First, deregister all renderers except debugOverlay:
    for (let property in rendererState) {
      if (rendererState.hasOwnProperty(property) && property !== 'debugOverlay') {
        rendererState[property] = false;
      }
    }

    activeRenderers.forEach(renderer => {
      if (rendererState.hasOwnProperty(renderer)) {
        rendererState[renderer] = true;
      }
    });
  };

  /*****************************************************************************
  | Fires all active renderers. This method is called on each cycle
  | from within the frame loop.
  */
  this.drawFrame = function(activeRenderers, ctx, canvas, controls, game, map, player) {

    // Clear the whole canvas:
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#6bc2d8';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let type in rendererState) {
      if (rendererState.hasOwnProperty(type) && rendererState[type] === true) {
        renderers[type](ctx, controls, game, map, player);
      }
    }
  };

  /*****************************************************************************
  | The welcome screen, displayed before a new game starts.
  */
  renderers.welcomeScreen = function(ctx) {
    // TODO
  };

  /*****************************************************************************
  | This overlay is drawn on top of the game while the player is waiting to be
  | respawned after losing a life.
  */
  renderers.playerGotHitOverlay = function(ctx) {
    // TODO
    //console.log('1')
  };

  /*****************************************************************************
  |
  */
  renderers.gameOverOverlay = function(ctx) {
    // TODO
  };

  /*****************************************************************************
  | Draws the screen displayed before a new game starts.
  */
  renderers.gameWonOverlay = function(ctx) {
    // TODO
  };

  /*****************************************************************************
  | Draws the screen displayed before a new game starts.
  */
  renderers.gameplayIntro = function(ctx) {
    // TODO
  };

  /*****************************************************************************
  | Draws the current frame while the gameplay is running.
  */
  renderers.gameplay = function(ctx, controls, game, map, player) {

    const offset = map.getOffset(player);



const TILE_SIZE = 70;

  /*  for(let y = 0; y < map.height.tiles; y++) {
      for(let x = 0; x < map.width.tiles; x++) {
        let tile = map.getTileNumber(x, y);
        ctx.fillStyle = tile ? '#B87C28' : '#92FAFF';
      //  if (isInRange(offset.map, {x: x * TILE_SIZE, y: y * TILE_SIZE, width: TILE_SIZE, height: TILE_SIZE}))
          ctx.fillRect(x * TILE_SIZE - offset.map.x - 1, y * TILE_SIZE - offset.map.y -1, TILE_SIZE + 2, TILE_SIZE +2);
      }
    }*/

    ctx.fillStyle = '#7D007D';
    map.entities.platforms.forEach(platform => {
      ctx.fillRect(platform.x - offset.map.x, platform.y - offset.map.y, platform.width, platform.height);
    });



    this._drawMapLayer(ctx, 0, offset.map, map);
    //this._drawEntities(ctx, 'platforms', offset.map, map.entitiesInRange.platforms);
    this._drawEntities(ctx, 'mobs', offset.map, map.entitiesInRange.mobs);
    this._drawPlayer(ctx, offset.player, player);
    this._drawMapLayer(ctx, 1, offset.map, map);
    this._drawOSD(ctx);

  };

  /*****************************************************************************
  |
  */

  renderers._drawMapLayer = function(ctx, layer, offset, map) {

    map.tiles.inRange.forEach(tile => {
      const sprite = map.getTileSprite(tile, layer);
      if (sprite) {
        const coords = map.getPixelCoordsFromTileIndex(tile);
        ctx.drawImage(
          sprite.image,
          sprite.x, sprite.y,
          sprite.width, sprite.height,
          coords.x - offset.x + sprite.drawOffsetX, coords.y - offset.y + sprite.drawOffsetY,
          sprite.width * scale, sprite.height * scale);
      }
    });
  };

  /*****************************************************************************
  |
  */

  renderers._drawEntities = function(ctx, type, offset, entities) {
    entities.forEach(entity => {
      const sprite = entity.getSprite();
      if (sprite) {


      /*  ctx.fillStyle = '#A1744D';

        ctx.fillRect(entity.x - offset.x, entity.y - offset.y, entity.width, entity.height);*/


        ctx.drawImage(
          sprite.image,
          sprite.x, sprite.y,
          sprite.width, sprite.height,
          entity.x - offset.x + sprite.drawOffsetX, entity.y - offset.y + sprite.drawOffsetY,
          sprite.width * scale, sprite.height * scale);
      }
    });
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
      sprite.width * scale, sprite.height * scale);
  };

  /*****************************************************************************
  |
  */

  renderers._drawOSD = function(ctx) {

  };

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

}
