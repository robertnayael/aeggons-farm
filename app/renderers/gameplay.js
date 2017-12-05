export default function(ctx, controls, game, map, player)  {

  const offset = map.getOffset(player);

  ctx.fillStyle = '#7D007D';
  map.entities.platforms.forEach(platform => {
    ctx.fillRect(platform.x - offset.map.x, platform.y - offset.map.y, platform.width, platform.height);
  });

  drawMapLayer(ctx, 0, offset.map, map);
  //this._drawEntities(ctx, 'platforms', offset.map, map.entitiesInRange.platforms);
  drawEntities(ctx, 'mobs', offset.map, map.entitiesInRange.mobs);
  drawPlayer(ctx, offset.player, player);
  drawMapLayer(ctx, 1, offset.map, map);
  drawOSD(ctx, player);

};

const scale = 1;

/*****************************************************************************
|
*/

function drawMapLayer (ctx, layer, offset, map) {

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

function drawEntities (ctx, type, offset, entities) {
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

function drawPlayer (ctx, offset, player) {

  const sprite = player.getSprite();
  if (sprite.opacity) ctx.globalAlpha = sprite.opacity;

  ctx.drawImage(
    sprite.image,
    sprite.x, sprite.y,
    sprite.width, sprite.height,
    offset.x + sprite.drawOffsetX, offset.y + sprite.drawOffsetY,
    sprite.width * scale, sprite.height * scale);

  ctx.globalAlpha = 1;
};

/*****************************************************************************
|
*/

function drawOSD (ctx, player) {
  ctx.font = "30px Arial";
  ctx.lineWidth = 1;
  ctx.strokeStyle = 'red';
  ctx.strokeText(`Lives: [${player.lives}]`, 500, 30);
};
