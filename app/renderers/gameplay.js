import Renderer from './Renderer';

export default class Gameplay extends Renderer {

  draw(ctx, scale, {player, map, score}) {

    const offset = map.getOffset(player);

    drawBackground(ctx, scale, offset.map, map);
    drawTileLayers(ctx, 'background', offset.map, map);
    drawEntities(ctx, scale, 'mobs', offset.map, map.entitiesInRange.mobs);
    drawEntities(ctx, scale, 'platforms', offset.map, map.entitiesInRange.platforms);
    drawEntities(ctx, scale, 'infoSigns', offset.map, map.entitiesInRange.infoSigns);
    drawEntities(ctx, scale, 'collectibles', offset.map, map.entitiesInRange.collectibles);
    drawPlayer(ctx, scale, offset.player, player);
    drawTileLayers(ctx, 'foreground', offset.map, map);
    drawScore(ctx, score);
    drawForeground(ctx, scale, offset.map, map);

  }

}

/*----------------------------------------------------------------------------*/

function drawTileLayers(ctx, plane, offset, map) {
  map.tiles[plane].forEach(layer => {
    for (let i = 0; i < map.tiles.inRange.length; i++) {

      const tileIndex = map.tiles.inRange[i],
            tileType = layer[tileIndex],
            sprite = map.getTileSprite(tileType);

      if (sprite) {
        const coords = map.getPixelCoordsFromTileIndex(tileIndex);
        ctx.drawImage(
          sprite.image,
          sprite.x, sprite.y,
          sprite.width, sprite.height,
          coords.x - offset.x + (sprite.drawOffsetX), coords.y - offset.y + (sprite.drawOffsetY),
          sprite.width, sprite.height);
      }
    }
  });
}

/*----------------------------------------------------------------------------*/

function drawEntities (ctx, scale, type, offset, entities) {
  entities.forEach(entity => {
    const sprite = entity.getSprite();
    if (sprite) {
      if (sprite instanceof Array) {
        sprite.forEach(layer => drawEntitySprite(ctx, offset, layer, entity));
      } else {
        drawEntitySprite(ctx, offset, sprite, entity);
      }
    }
  });
};

/*----------------------------------------------------------------------------*/

function drawEntitySprite (ctx, offset, sprite, entity) {
  if (!sprite) return;

  let pos;

  if (sprite && sprite.fixedPosition) {
    pos = sprite.fixedPosition;
  } else {
    pos = entity;
  }

  if ('opacity' in sprite) ctx.globalAlpha = sprite.opacity;
  ctx.drawImage(
    sprite.image,
    sprite.x, sprite.y,
    sprite.width, sprite.height,
    pos.x - offset.x + sprite.drawOffsetX, pos.y - offset.y + sprite.drawOffsetY,
    sprite.width, sprite.height
  );
  ctx.globalAlpha = 1;
}

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

function drawScore (ctx, score) {
  ctx.textBaseline = 'top';
  const {itemGroups, groupWidth, position} = score.getScoreForDisplay();
  let {x, y} = position;

  itemGroups.forEach(group => {
    drawScoreItemGroup(ctx, group, x, y);
    x = x + groupWidth;
  });

  //throw new Error('------');
};

/*----------------------------------------------------------------------------*/

function drawScoreItemGroup (ctx, group, x, y) {
  const draw = {
    text: drawScoreText,
    sprite: drawScoreSprite
  };

  group.forEach(item => {
    x = x + draw[item.type](ctx, item, x, y);
  });
}

/*----------------------------------------------------------------------------*/

function drawScoreText (ctx, text, x, y) {
  ctx.font = text.font;
  ctx.lineWidth = text.lineWidth;
  ctx.fillStyle = text.fillStyle;
  ctx.strokeStyle = text.strokeStyle;

  ctx.strokeText(text.content, x, y);
  ctx.fillText(text.content, x, y);

  return ctx.measureText(text.content).width;
}

/*----------------------------------------------------------------------------*/

function drawScoreSprite (ctx, sprite, x, y) {
  ctx.drawImage(
    sprite.image,
    sprite.x, sprite.y,
    sprite.width, sprite.height,
    x + (sprite.marginLeft || 0), y + (sprite.marginTop || 0),
    sprite.width, sprite.height
  );
  return sprite.width + (sprite.marginLeft || 0) + (sprite.marginRight || 0);
}

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
