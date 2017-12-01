export default {

  baseTileSize: 70,
  canvasID: "canvas",
  initMessageID: "init-message",
  errorMessageID: "error-message",
  viewportWidth: 22,
  viewportHeight: 11,
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
    "lives": 3,
    movementParams: {
      vMax: {
        x: 350,
        y: 1100
      },
      midAirControl:  1,        // Caps horizontal vMax while in the air. Ranges from 0 (no horizontal velocity) to 1 (full horizontal velocity).
      acceleration:   0.05,     // Horizontal acceleration. Ranges from 0 (no acceleration) to 1 (instant acceleration)
      gravity:        3500,
      jumpForce:      100000,   // Instantaneous jump force
      pushForce:      55000,    // Instantaneous push force (when the player is pushed away sideways by an enemy)
      friction:       1500,     // Slows down any horizontal movement if the left/right key is not pressed.
    }
  }

};
