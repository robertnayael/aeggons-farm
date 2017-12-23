import "es6-promise/auto";
import 'isomorphic-fetch';

import game from './game';
import GameMap from './map';
import Player from './player';
import Sprites from './sprites';
import Canvas from './Canvas';

/** @module GameController */

/**
 * Controls the whole app.
 * @constructor
 * @param {object} config - Configuration settings.
 */
export default function GameController (config) {

/*----------------------------------------------------------------------------*/

  let delta = 0,
      now,
      last = timestamp(),
      step,

      canvas,

      controls = {},

    //  game,
      map,
      sprites,
      player;

  const KEYCODES = {SPACE: 32, LEFT: 37, UP: 38, RIGHT: 39, DOWN: 40, ENTER: 13, ESCAPE: 27, TILDE: 192};

/*----------------------------------------------------------------------------*/

  /**
   * Executes all initialization functions and then runs the main game loop.
   */
  this.go = function() {

    loadGameData()
      .then(makeObjects)
      .then(initializeObjects)
      .then(globalizeObjects)
      .then(setupEventListeners)
      .then(hideWaitMessage)
      .then(frameLoop)
      .catch(showErrorMessage);
  };

/*----------------------------------------------------------------------------*/

  /**
   * Loads all JSON files with game data.
   *
   * @returns {Promise} Resolves to an object containing the contents of all game data files.
   */
  function loadGameData() {

    // A list of the data files, as specified in the config:
    const data = {
      sprites: config.dataFiles.sprites,
      map: config.dataFiles.map,
      entities: config.dataFiles.entities};

    // Attempt to fetch each file:
    const promises = Object.getOwnPropertyNames(data).map(dataType => {
      const filename = data[dataType];
      return getJson(filename)
        .then(contents => {data[dataType] = contents;});  // Puts the file contents under the respective key in <data>.
    });

    return Promise
      .all(promises)
      .then(() => data);  // The promise will resolve to this.
  }

/*----------------------------------------------------------------------------*/

  /** Fetches and parses a single JSON file.
   *
   * @function
   * @returns {Promise}
   */
  const getJson = function(file) {
    return fetch(file)
    .then(
      function(response) {
        if (response.status >= 200 && response.status < 300) {
          return Promise.resolve(response);
        } else {
          return Promise.reject(new Error(response.statusText));
        }
      }
    )
    .then(response => response.json());
  };

/*----------------------------------------------------------------------------*/

  /**
   * Initializes core game objects.
   */
  function makeObjects(gameData) {
    config.tileSize = getTileSize(config.baseTileSize);
    config.scale = config.tileSize / config.baseTileSize;

    step = 1 / config.FPS;

    canvas = new Canvas(config);
    sprites = new Sprites(gameData['sprites']);
    map = new GameMap(gameData['map'], gameData['entities'], config, sprites);
    player = new Player(config.player, config.tileSize, config.scale, sprites);


    return sprites.loadImages(config.spritesDir); // Returns promise
  }

/*----------------------------------------------------------------------------*/

  function initializeObjects() {

    canvas.setupCanvasElement();
    map.initializeBackground();
    canvas.setScreenOverlayLayers(sprites.getScreenOverlayLayers());

  }

/*----------------------------------------------------------------------------*/

  /**
   * Hides the initial waiting message; called after loading all assets and
   *     successfully inititializing the game.
   */
  function hideWaitMessage() {
    const waitMessage = document.getElementById(config.initMessageID);
    waitMessage.style.display = 'none';
  }


  /**
   * Shoes an error message to the user if anything goes wrong.
   */
  function showErrorMessage(error) {
    const errorMessage = document.getElementById(config.errorMessageID);
    errorMessage.style.display = 'block';

    if(config.debug) console.error(error);
  }

/*----------------------------------------------------------------------------*/

  /**
   * Globalizes some the key objects for development purposes.
   */
  function globalizeObjects() {
    if (config.debug !== true) return false;

    window._game = game;
    window._map = map;
    window._player = player;
    window._canvas = canvas;
    window._sprites = sprites;
  }

  function keyListener(event, key, isDown) {
    switch(key) {
      case KEYCODES.LEFT:   controls.left   = isDown; return false;
      case KEYCODES.RIGHT:  controls.right  = isDown; return false;
      case KEYCODES.SPACE:  controls.jump   = isDown; return false;
      case KEYCODES.UP:     controls.jump   = isDown; return false;
      case KEYCODES.ENTER:  controls.accept = isDown; return false;
      case KEYCODES.ESCAPE: controls.exit   = isDown; return false;
      case KEYCODES.TILDE:  controls.debug  = isDown; return false;
    }
  };

/*----------------------------------------------------------------------------*/

  /**
   * Determines the actual tile size (which may or may not be less than the
   *     base tile size specified in the configuration.)
   * @param  {number} baseSize - Base tile size.
   * @return {number} Actual tile size to be used.
   */
  function getTileSize(baseSize) {
    return baseSize / 1;
  }

/*----------------------------------------------------------------------------*/

  let activeRenderers = [];

  /**
   * Runs a cycle which involves the following:
   *     (1) update the game state,
   *     (2) enable necessary renderers,
   *     (3) draw the current frame on the canvas.
   */
  function frameLoop() {

    now = timestamp();                            // time at the start of this loop
    delta = delta + Math.min(1, (now - last) / 1000);
    while(delta > step) {                         // make sure the game catches up if the delta is too high
      delta = delta - step;
      activeRenderers = game.run(step, config, controls, sprites, map, player);
    }
    let included = false;

    canvas.registerRenderers(activeRenderers);
    canvas.drawFrame(activeRenderers, controls, game, map, player);

    last = now;                                   // time at the start of the previous loop
    requestAnimationFrame(frameLoop, canvas.element);
  }

/*----------------------------------------------------------------------------*/

  function timestamp() {
    if (window.performance && window.performance.now)
      return window.performance.now();
    else
      return new Date().getTime();
  }

/*----------------------------------------------------------------------------*/

  function setupEventListeners() {
    document.addEventListener('keydown', event => keyListener(event, event.keyCode, true), false);
    document.addEventListener('keyup', event => keyListener(event, event.keyCode, false), false);
    window.addEventListener("resize", canvas.resize.bind(canvas));
  }

/*----------------------------------------------------------------------------*/

};
