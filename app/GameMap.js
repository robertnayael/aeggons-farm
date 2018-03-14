import Platform from './entities/Platform';
import Mob from './entities/Mob';
import Spikes from './entities/Spikes';
import Collectible from './entities/Collectible';
import Background from './Background';

export default class GameMap {

/******************************************************************************/

  constructor({data, config, sprites}) {

    this.sprites = sprites;
    this.tileSize = config.tileSize;
    this.scale = config.scale;

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

  initializeEntities() {

    this.entities = {
      platforms: [],
      mobs: [],
      spikes: [],
      collectibles: []
    };

    this.data.entities.platforms.forEach(platform => this.entities.platforms.push(
      new Platform(platform, this.tileSize, this.scale, this.sprites)
    ));
    this.data.entities.mobs.forEach(mob => this.entities.mobs.push(
      new Mob({...this.data.mobTypes[mob.type], ...mob}, this.tileSize, this.scale, this.sprites)
    ));
    this.data.entities.spikes.forEach(spikes => this.entities.spikes.push(
      new Spikes(spikes, this.tileSize, this.scale, this.sprites)
    ));
    this.data.entities.collectibles.forEach(collectible => this.entities.collectibles.push(
      new Collectible({...this.data.collectibleTypes[collectible.type], ...collectible}, this.tileSize, this.scale, this.sprites)
    ));
  }

/******************************************************************************/
// TODO: make this DRY
  updateEntities(step) {
    this.entities.platforms.forEach(platform => platform.update(step));
    this.entities.mobs.forEach(mob => mob.update(step));
    this.entities.spikes.forEach(spikes => spikes.update(step));
    this.entities.collectibles.forEach(collectible => collectible.update(collectible));
  }

/******************************************************************************/

  updateVisibilityRange(player) {
    const offset = this.getOffset(player);

    this.tiles.inRange = this.updateTilesInRange(offset.map, this.tiles.collision.length);
    this.entitiesInRange = this.updateEntitiesInRange(offset.map, this.entities);
  }

/******************************************************************************/

  updateTilesInRange(offset, tilesCount) {

    const margin = 5,
    tileOffset = {
      x: Math.floor(offset.x / this.tileSize),
      y: Math.floor(offset.y / this.tileSize)
    },
    boundary = {
      top: Math.max(Math.floor(offset.y / this.tileSize) - margin, 0),
      bottom: Math.min(this.height.tiles, tileOffset.y + this.viewport.height.tiles + margin) - 1,
      left: Math.max(0, tileOffset.x - margin),
      right: Math.min(this.width.tiles, tileOffset.x + this.viewport.width.tiles + margin) - 1
    };

    const range = {
      start: this.getTileIndexFromTileCoords(boundary.left, boundary.top),
      end: this.getTileIndexFromTileCoords(boundary.right, boundary.bottom)
    };

    const tileDimensions = {width: this.tileSize, height: this.tileSize};
    let tilesInRange = [];

    for (let i = range.start; i <= range.end; i++) {
      tilesInRange.push(i);
    }

    return tilesInRange;
  }

/******************************************************************************/

  updateEntitiesInRange(offset, entities) {

    let entitiesInRange = {
      platforms: [],
      mobs: [],
      spikes: [],
      collectibles: []
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

    return {
      NE: this.tiles.collision[this.getTileIndexFromPixelCoords(x, y)],
      NW: this.tiles.collision[this.getTileIndexFromPixelCoords(x + xSize, y)],
      SE: this.tiles.collision[this.getTileIndexFromPixelCoords(x, y + ySize)],
      SW: this.tiles.collision[this.getTileIndexFromPixelCoords(x + xSize, y + ySize)]
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
   * 1) the map offset (relative to the absolute [0,0]), so that all map objects
   *    can be drawn relative to the player's position;
   * 2) the player offset (relative to the viewport center), which occurs if the
   *    player happens to be too close to a map edge.
   */
  getOffset(player) {

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
      {width: this.viewport.width.px, height: this.viewport.height.px},
      {x: player.position.x, y: player.position.y},
      {width: this.width.px, height: this.height.px}
    );

  };

  /****************************************************************************/
}
