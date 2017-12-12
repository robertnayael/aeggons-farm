export default function(ctx, justEnabled, scale, controls, game, map, player)  {

  const offset = map.getOffset(player);

  ctx.fillStyle = '#7D007D';
  map.entities.platforms.forEach(platform => {
    ctx.fillRect(platform.x - offset.map.x, platform.y - offset.map.y, platform.width, platform.height);
  });

  drawMapLayer(ctx, scale, 0, offset.map, map);
  //this._drawEntities(ctx, scale, 'platforms', offset.map, map.entitiesInRange.platforms);
  drawEntities(ctx, scale, 'mobs', offset.map, map.entitiesInRange.mobs);
  drawPlayer(ctx, scale, offset.player, player);
  drawMapLayer(ctx, scale, 1, offset.map, map);
  drawOSD(ctx, scale, player);

};

/*****************************************************************************
|
*/

function drawMapLayer (ctx, scale, layer, offset, map) {

  map.tiles.inRange.forEach(tile => {
    const sprite = map.getTileSprite(tile, layer);
    if (sprite) {
      const coords = map.getPixelCoordsFromTileIndex(tile);
      ctx.drawImage(
        sprite.image,
        sprite.x, sprite.y,
        sprite.width, sprite.height,
        coords.x - offset.x + (sprite.drawOffsetX * scale), coords.y - offset.y + (sprite.drawOffsetY * scale),
        sprite.width * scale, sprite.height * scale);
    }
  });
};

/*****************************************************************************
|
*/

function drawEntities (ctx, scale, type, offset, entities) {
  entities.forEach(entity => {
    const sprite = entity.getSprite();
    if (sprite) {


    /*  ctx.fillStyle = '#A1744D';

      ctx.fillRect(entity.x - offset.x, entity.y - offset.y, entity.width, entity.height);*/


      ctx.drawImage(
        sprite.image,
        sprite.x, sprite.y,
        sprite.width, sprite.height,
        entity.x - offset.x + (sprite.drawOffsetX * scale), entity.y - offset.y + (sprite.drawOffsetY * scale),
        sprite.width * scale, sprite.height * scale);
    }
  });
};

/*****************************************************************************
|
*/

function drawPlayer (ctx, scale, offset, player) {

  const sprite = player.getSprite();
  if (sprite.opacity) ctx.globalAlpha = sprite.opacity;

  ctx.drawImage(
    sprite.image,
    sprite.x, sprite.y,
    sprite.width, sprite.height,
    offset.x + (sprite.drawOffsetX * scale), offset.y + (sprite.drawOffsetY * scale),
    sprite.width * scale, sprite.height * scale);

  ctx.globalAlpha = 1;


};

/*****************************************************************************
|
*/

function drawOSD (ctx, scale, player) {
  ctx.font = "30px Arial";
  ctx.lineWidth = 1;
  ctx.strokeStyle = 'red';
  ctx.strokeText(`Lives: [${player.lives}]`, 500, 30);
};
