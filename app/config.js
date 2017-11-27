export default {

  baseTileSize: 70,
  canvasID: "canvas",
  initMessageID: "init-message",
  errorMessageID: "error-message",
  viewportWidth: 20,
  viewportHeight: 9,
  FPS: 60,
  spritesData: "./data/sprites.json",
  mapData: "./data/map.json",
  mapEntitiesData: "./data/entities.json",
  spritesDir: "./sprites/",
  waitOnGameStateChange: 3000,
  "debug": true,

  "player": {
    "initialPosition": {
      "x": 2,
      "y": 3
    },
    "lives": 3
  }

}
