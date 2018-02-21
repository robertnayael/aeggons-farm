import Renderer from './Renderer';

export default class Gameplay extends Renderer {

  draw(ctx, scale, {player, entities, map}) {

    const offset = map.getOffset(player);

    drawBackground(ctx, scale, offset.map, map);

    drawMapLayer(ctx, scale, 0, offset.map, map);
    drawEntities(ctx, scale, 'mobs', offset.map, map.entitiesInRange.mobs);
    drawEntities(ctx, scale, 'platforms', offset.map, map.entitiesInRange.platforms);
    drawPlayer(ctx, scale, offset.player, player);
    drawMapLayer(ctx, scale, 1, offset.map, map);
    drawOSD(ctx, scale, player);
    drawForeground(ctx, scale, offset.map, map);

  }

}

/*----------------------------------------------------------------------------*/

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

/*----------------------------------------------------------------------------*/

function drawEntities (ctx, scale, type, offset, entities) {
  entities.forEach(entity => {
    const sprite = entity.getSprite();
    if (sprite) {

      ctx.drawImage(
        sprite.image,
        sprite.x, sprite.y,
        sprite.width, sprite.height,
        entity.x - offset.x + (sprite.drawOffsetX * scale), entity.y - offset.y + (sprite.drawOffsetY * scale),
        sprite.width * scale, sprite.height * scale);
    }
  });
};

/*----------------------------------------------------------------------------*/

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

/*----------------------------------------------------------------------------*/

function drawOSD (ctx, scale, player) {
  ctx.font = "30px Arial";
  ctx.lineWidth = 1;
  ctx.strokeStyle = 'red';
  ctx.strokeText(`Lives: [${player.lives}]`, 500, 30);
};

/*----------------------------------------------------------------------------*/

function drawBackground(ctx, scale, mapOffset, map) {

  map.background.getBackgroundLayers().forEach(layer => {
    drawBackgroundLayer(ctx, scale, mapOffset, map, layer);
  });
}

/*----------------------------------------------------------------------------*/

function drawForeground(ctx, scale, mapOffset, map) {

  map.background.getForegroundLayers().forEach(layer => {
    drawBackgroundLayer(ctx, scale, mapOffset, map, layer);
  });
}

/*----------------------------------------------------------------------------*/

function drawBackgroundLayer(ctx, scale, mapOffset, map, backgroundLayer) {
  const layer = backgroundLayer.getSprite(
    mapOffset,
    scale,
    {width: map.width.px, height: map.height.px},                     // map dimensions
    {width: map.viewport.width.px, height: map.viewport.height.px});  // viewport dimensions

    ctx.drawImage(
      layer.image,
      layer.x, layer.y,
      map.viewport.width.px * (1/scale), map.viewport.height.px * (1/scale),
      0, 0,
      map.viewport.width.px, map.viewport.height.px);

    if (layer.repeatX !== false) {
      ctx.drawImage(
        layer.image,
        0, layer.y,
        map.viewport.width.px * (1/scale), map.viewport.height.px * (1/scale),
        layer.repeatX, 0,
        map.viewport.width.px, map.viewport.height.px);
    }
}

/*----------------------------------------------------------------------------*/
