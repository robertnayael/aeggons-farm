export default {

  baseTileSize: 70,
  canvasID: "canvas",
  initMessageID: "init-message",
  errorMessageID: "error-message",
  viewportWidth: 27,
  viewportHeight: 13,
  FPS: 60,
  dataFiles: {
    sprites: "./data/sprites.json",
    map: "./data/map.json",
    entities: "./data/entities.json",
    mobTypes: "./data/mobTypes.json",
    overlays: "./data/overlays.json",
  },
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
      jumpForce:      85000,   // Instantaneous jump force
      pushForce:      55000,    // Instantaneous push force (when the player is pushed away sideways by an enemy)
      friction:       1500,     // Slows down any horizontal movement if the left/right key is not pressed.
    },
    invulnerabilityOnHit:  5000, // How long the player cannot move if hit by mobs [ms]
    opacityPulsingOnHit: [1, 0.95, 0.90, 0.85, 0.80, 0.75, 0.70, 0.65, 0.60, 0.55, 0.50, 0.45, 0.40, 0.50, 0.60, 0.70, 0.80, 0.90]
  }

};
