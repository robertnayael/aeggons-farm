import "es6-promise/auto";
import 'isomorphic-fetch';

import game from './game';
import Canvas from './Canvas';
import ProgressBar from './ProgressBar';

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

    const progressBar = new ProgressBar({
      parentElement: config.progressBarParent,
      classModifier: 'data-files',
      label: 'loading data files',
      steps: Object.keys(filenames).length
    });

    // Attempt to fetch each file:
    const promises = Object.getOwnPropertyNames(filenames).map(dataType => {
      const filename = filenames[dataType];
      return getJson(filename)
        .then(contents => {gameData[dataType] = contents;})
        .then(() => progressBar.increase());
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
   * Shows an error message to the user if anything goes wrong.
   */
  function showErrorMessage(error) {
    if(config.debug) console.error(error);
    const errorMessage = document.getElementById(config.errorMessageID);
    errorMessage.classList.add('is-active');
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

/*----------------------------------------------------------------------------*/

  /**
   * Registers control signals based on keydown/keyup events.
   */
  function keyListener(event, key, isDown) {
    switch(key) {
      case KEYCODES.LEFT:   controls.left   = isDown; return false;
      case KEYCODES.RIGHT:  controls.right  = isDown; return false;
      case KEYCODES.UP:
      case KEYCODES.SPACE: {
        // If jump keys are set to work all the time, just register the keydown/keyup;
        // this means the jump signal will be on for as long as the jump key remains pressed,
        // so multiple jumps can be performed without depressing the key.
        if (!config.player.movementParams.lockJumpKeys) {
          controls.jump = isDown;
          return false;
        }

        // Lock jump keys after a jump and until the next keyup
        if (isDown) {
          controls.jump = !controls.jumpLocked; // trigger jump only if the lock is off
          controls.jumpLocked = true;
          // Disable the jump signal after a short while even if no keyup event takes place
          // (i.e. if the player still holds the jump key pressed down);
          // 5 frames seems to be a reasonable time.
          if (controls.jump) setTimeout(() => controls.jump = false, 1000 / config.FPS * 5);
        }
        else { // jump key released
          controls.jump = false;
          controls.jumpLocked = false;
        }
        return false;
      }
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
