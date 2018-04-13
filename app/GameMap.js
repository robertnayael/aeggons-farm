import Platform from './entities/Platform';
import Mob from './entities/Mob';
import Spikes from './entities/Spikes';
import Collectible from './entities/Collectible';
import InfoSign from './entities/InfoSign';
import Decoration from './entities/Decoration';
import FinishingArea from './entities/FinishingArea';
import Background from './Background';

export default class GameMap {

/******************************************************************************/

  constructor({data, config, sprites}) {

    this.sprites = sprites;
    this.tileSize = config.tileSize;
    this.scale = config.scale;
    this.basePlayerOffsetY = config.playerOffsetY * this.tileSize || 0;

    this.viewport = {
      width: {
        px: config.viewportWidth * this.tileSize,
        tiles: config.viewportWidth
      },
      height: {
        px: config.viewportHeight * this.tileSize,
        tiles: config.viewportHeight
      }
    };

    this.width = {
      tiles: data.map.width,
      px: data.map.width * this.tileSize
    };
    this.height = {
      tiles: data.map.height,
      px: data.map.height * this.tileSize
    };

    this.tiles = {
      collision: data.map.layers.collision,
      background: data.map.layers.background,
      foreground: data.map.layers.foreground,
      inRange: []
    };

    this.data = data;

    this.entities = {};
    this.entitiesInRange = {};
  }

/******************************************************************************/

  initializeBackground() {
    this.background = new Background(this, this.scale, this.sprites.getbackgroundSprites());
  }

/******************************************************************************/

  initializeEntities({victoryConditionsMet}) {

    this.entities = {
      platforms: [],
      mobs: [],
      spikes: [],
      collectibles: [],
      infoSigns: [],
      specialObjects: []
    };

    this.initializeDecorations();

    this.data.entities.platforms.forEach(platform => this.entities.platforms.push(
      new Platform(platform, this.tileSize, this.scale, this.sprites)
    ));
    this.data.entities.mobs.forEach(mob => this.entities.mobs.push(
      new Mob({...this.data.mobTypes[mob.type], ...mob, mapBounds: this.getMapBounds()}, this.tileSize, this.scale, this.sprites)
    ));
    this.data.entities.spikes.forEach(spikes => this.entities.spikes.push(
      new Spikes(spikes, this.tileSize, this.scale, this.sprites)
    ));
    this.data.entities.collectibles.forEach(collectible => this.entities.collectibles.push(
      new Collectible({...this.data.collectibleTypes[collectible.type], ...collectible}, this.tileSize, this.scale, this.sprites)
    ));
    this.data.entities.infoSigns.forEach(infoSign => this.entities.infoSigns.push(
      new InfoSign(infoSign, this.tileSize, this.scale, this.sprites)
    ));

    this.data.entities.special.forEach(entity => {
      switch(entity.type) {
        case 'start': { // player's starting position
          this.initialPlayerPos = { x: entity.x, y: entity.y };
          break;
        }
        case 'finish': {
          this.entities.specialObjects.push(
            new FinishingArea(entity, this.tileSize, this.scale, this.sprites, victoryConditionsMet)
          );
          break;
        }
      }
    });
  }

/******************************************************************************/

  getMapBounds() {
    return {
      top: 0,
      right: this.width.px,
      bottom: this.height.px,
      left: 0
    };
  }

/******************************************************************************/

  initializeDecorations() {

    const flatList = this.entities.decorations = []; // flat list for faster evaluation of visibility

    this.decorations = { // multi-level list (includes information about layer plane and index)
      background: [],
      foreground: []
    };

    const initializePlane = (plane) =>
    this.data.entities.decorations[plane].forEach(layer => {
      this.decorations[plane].push(layer.map(decoration => {
        const entity = new Decoration(decoration, this.tileSize, this.scale, this.sprites);
        flatList.push(entity);
        return entity;
      }));
    });

    initializePlane('background');
    initializePlane('foreground');
  }

/******************************************************************************/

  getDecorationLayers(plane) {
    return this.decorations[plane].map(layer =>
      layer.map(decoration => {
        if (this.entitiesInRange.decorations.includes(decoration)) return decoration;
      })
    );
  }

/******************************************************************************/
// TODO: make this DRY
  updateEntities(step) {
    this.entities.platforms.forEach(platform => platform.update(step));
    this.entities.mobs.forEach(mob => mob.update(step));
    this.entities.spikes.forEach(spikes => spikes.update(step));
    this.entities.collectibles.forEach(collectible => collectible.update(step));
    this.entities.infoSigns.forEach(infoSign => infoSign.update(step));
    this.entities.specialObjects.forEach(infoSign => infoSign.update(step));
  }

/******************************************************************************/

  updateVisibilityRange(player) {
    const offset = this.getOffset(player);

    this.tiles.inRange = this.updateTilesInRange(offset.map, this.tiles.collision.length);
    this.entitiesInRange = this.updateEntitiesInRange(offset.map, this.entities);
  }

/******************************************************************************/

  updateTilesInRange(offsetPx, tilesCount) {

    // number of tiles outside the viewable area to include in the range
    const margin = 5;

    // tile-based map offset
    const mapOffset = {
      x: Math.floor(offsetPx.x / this.tileSize),
      y: Math.max(Math.floor(offsetPx.y / this.tileSize), 0)
    };

    // tile-based viewport size
    const viewport = {
      width: this.viewport.width.tiles,
      height: this.viewport.height.tiles,
    };

    // map dimensions
    const map = {
      width: this.width.tiles,
      height: this.height.tiles
    };

    // tile-based x and y coordinates of the range area's edges;
    const edges = trimEdges({
      top: mapOffset.y - margin,
      bottom: mapOffset.y + viewport.height + margin,
      left: mapOffset.x - margin,
      right: mapOffset.x + viewport.width + margin
    });
  
    // "trim" the edges so they don't go over map bounds
    function trimEdges({top, bottom, left, right}) {
      return {
        top: Math.max(top, 0),
        bottom: Math.min (bottom, map.height),
        left: Math.max (left, 0),
        right: Math.min (right, map.width),
      }
    };

    // gather the (x, y) coords of all map tiles falling within the range
    const tilesInRange = [];
    for (let x = edges.left; x < edges.right; x++) {
      for (let y = edges.top; y < edges.bottom; y++) {
        tilesInRange.push([x, y]);
      }
    }

    // return tile indexes
    return tilesInRange.map(
      ([x, y]) => this.getTileIndexFromTileCoords(x, y)
    );
  }

/******************************************************************************/

  updateEntitiesInRange(offset, entities) {

    let entitiesInRange = {
      platforms: [],
      mobs: [],
      spikes: [],
      collectibles: [],
      infoSigns: [],
      decorations: [],
      specialObjects: []
    };

    Object.getOwnPropertyNames(entities).forEach(type => {
      this.entities[type].forEach(entity => {
        if (this.isInRange(offset, entity)) {
          entitiesInRange[type].push(entity);
        }
      });
    });

    return entitiesInRange;
  }

/******************************************************************************/

  getTilesInRange() {

  }

/******************************************************************************/

  getEntitiesInRange() {

  }

/******************************************************************************/

  getTileSprite(tileType) {
    if (tileType) return this.sprites.getSprite(['mapTiles', String(tileType)]);
  }

/******************************************************************************/

  getOverlappingTiles(x, y) {

    const xSize = this.tileSize;
    const ySize = this.tileSize;

    const getTile = (x, y) => {
      const tile = this.tiles.collision[this.getTileIndexFromPixelCoords(x, y)];
      // If the tile doesn't exist, i.e. it's out of map bounds, assume it's "solid",
      // so the character cannot move out of the map.
      return tile === undefined
        ? 1
        : tile;
    }

    return {
      NE: getTile(x, y),
      NW: getTile(x + xSize, y),
      SE: getTile(x, y + ySize),
      SW: getTile(x + xSize, y + ySize)
    };
  }

/******************************************************************************/

  // [change name to 'isTileSolid']
  getTileNumber(x, y) {
    return this.tiles.collision[x + y * this.width.tiles];
  }

/******************************************************************************/

  // Returns the index of the tile that covers the specified pixel-based coordinates
  getTileIndexFromPixelCoords(x, y) {
    if (x < 0 || y <0 || x > this.width.px || y > this.width.px) return; // coords are out of bounds: don't return any index
    var qx = Math.floor(x / this.tileSize);
    var qy = Math.floor(y / this.tileSize);
    return qx + qy * this.width.tiles;
  }

/******************************************************************************/

  // Returns the index of the tile with the specified tile-based coordinates
  getTileIndexFromTileCoords(x, y) {
    return x + y * this.width.tiles;
  }

/******************************************************************************/

  // Returns tile-based coordinates (x,y) of the tile with the specified index
  getTileCoordsFromTileIndex(i) {
    return {
      x: i % this.width.tiles,
      y: Math.floor(i / this.width.tiles)
    };
  }

/******************************************************************************/

  // Returns pixel-based coordinates (x,y) of the tile with the specified index
  getPixelCoordsFromTileIndex(i) {
    return {
      x: (i % this.width.tiles) * this.tileSize,
      y: Math.floor(i / this.width.tiles) * this.tileSize
    };
  }

  /*****************************************************************************
  |
  */
  isInRange (offset, object) {

    return (function(viewport, offset, object, safetyMargin) {

      // Drawing range, calculated from the viewport center. Let's make it lightly larger than 1/2 of the viewport, just to be safe.
      let range = {
        horizontal: viewport.width/2 + safetyMargin,
        vertical: viewport.height/2 + safetyMargin
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
      };

      // Returns false if any distance exceeds the respective range, true otherwise
      return !(
        distance.left > range.horizontal
        || distance.right > range.horizontal
        || distance.top > range.vertical
        || distance.bottom > range.vertical
      );
    })(
      {width: this.viewport.width.px, height: this.viewport.height.px},
      offset,
      object,
      this.tileSize * 5
    );
  }

  /**
   * Calculates:
   * 1) the map offset, which is used for drawing all non-player objects; this is relative to (0,0) of the viewport
   * 2) the player offset (relative to the viewport center + base player offset), which occurs if the
   *    player happens to be too close to a map edge.
   */
  getOffset(player) {

    return (function(viewport, player, map) {

      const basePlayerOffsetY = player.baseOffsetY;

      const playerOffcenterLeft = Math.min(0, player.x - viewport.width/2),
            playerOffcenterRight = Math.max( 0, (player.x + viewport.width/2) - map.width),
            playerOffcenterX = playerOffcenterLeft + playerOffcenterRight;

      const playerOffcenterTop = Math.min(0 + basePlayerOffsetY, player.y - viewport.height/2 + basePlayerOffsetY),
            playerOffcenterBottom = Math.max(0, (player.y + viewport.height/2 - basePlayerOffsetY) - map.height),
            playerOffcenterY = playerOffcenterTop + playerOffcenterBottom //+ basePlayerOffsetY;

            // console.log(
            //   playerOffcenterY / 70
            // );
            // //console.log(((player.y - viewport.height/2) - playerOffcenterY) / 70)
            // throw new Error();

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
      {width: this.viewport.width.px, height: this.viewport.height.px},
      {x: player.position.x, y: player.position.y, baseOffsetY: this.basePlayerOffsetY},
      {width: this.width.px, height: this.height.px}
    );

  };

  /****************************************************************************/
}
