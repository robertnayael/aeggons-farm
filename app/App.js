import "es6-promise/auto";
import 'isomorphic-fetch';

import game from './game';
import Canvas from './Canvas';

/**
 * Controls the whole app.
 * @constructor
 * @param {object} config - Configuration settings.
 */
export default function App (config) {

/*----------------------------------------------------------------------------*/

  let delta = 0,
      now,
      last = timestamp(),
      step = 1 / config.FPS,

      gameData = {},
      canvas,

      controls = {};

  const KEYCODES = {SPACE: 32, LEFT: 37, UP: 38, RIGHT: 39, DOWN: 40, ENTER: 13, ESCAPE: 27, TILDE: 192};

/*----------------------------------------------------------------------------*/

  /**
   * Executes all initialization functions and then runs the main game loop.
   */
  this.go = function() {

    loadGameData()
      .then(prepareGame)
      .then(() => prepareCanvas(gameData.overlays))
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
    const filenames = {
      sprites: config.dataFiles.sprites,
      map: config.dataFiles.map,
      entities: config.dataFiles.entities,
      mobTypes: config.dataFiles.mobTypes,
      collectibleTypes: config.dataFiles.collectibleTypes,
      overlays: config.dataFiles.overlays
    };

    // Attempt to fetch each file:
    const promises = Object.getOwnPropertyNames(filenames).map(dataType => {
      const filename = filenames[dataType];
      return getJson(filename)
        .then(contents => {gameData[dataType] = contents;});
    });

    return Promise
      .all(promises)
      .then(() => gameData);
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

  function prepareGame(gameData) {
    return game.bootstrap({config, gameData});
  }

/*----------------------------------------------------------------------------*/

  function prepareCanvas(overlays) {
    canvas = new Canvas(config, overlays);
    canvas.initialize(game.sprites);
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

/*----------------------------------------------------------------------------*/

  /**
   * Shows an error message to the user if anything goes wrong.
   */
  function showErrorMessage(error) {
    if(config.debug) console.error(error);
    const errorMessage = document.getElementById(config.errorMessageID);
    errorMessage.style.display = 'block';
    if(canvas) canvas.element.style.display = 'none';
  }

/*----------------------------------------------------------------------------*/

  /**
   * Globalizes some the key objects for development purposes.
   */
  function globalizeObjects() {
    if (config.debug !== true) return false;

    window._game = game;
    window._map = game.map;
    window._player = game.player;
    window._canvas = canvas;
    window._sprites = game.sprites;
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

  let activeRenderers = [];

  /**
   * Runs a cycle which involves the following:
   *     (1) update the game state,
   *     (2) enable necessary renderers,
   *     (3) draw the current frame on the canvas.
   */
  function frameLoop() {
    try {
      now = timestamp();                            // time at the start of this loop
      delta = delta + Math.min(1, (now - last) / 1000);
      while(delta > step) {                         // make sure the game catches up if the delta is too high
        delta = delta - step;
        activeRenderers = game.run(step, config, controls);
      }

      canvas.registerRenderers(activeRenderers);
      canvas.drawFrame(
        activeRenderers,
        {
          controls,
          player: game.player,
          map: game.map,
          score: game.score
        }
      );

      last = now;
      requestAnimationFrame(frameLoop, canvas.element);
    }
    catch (error) {
      showErrorMessage(error);
    }
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
