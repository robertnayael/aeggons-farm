import "es6-promise/auto";
import 'isomorphic-fetch';

import game from './game';
import {onkey} from './keylistener';
import GameMap from './map';
import Player from './player';
import Sprites from './sprites';
import {Renderer} from './renderer';

/** @module GameController */

/**
 * Controls the whole app.
 * @constructor
 * @param {object} config - Configuration settings.
 */
export default function GameController (config) {

  let delta = 0,
      now,
      last = timestamp(),
      step,

      canvas,
      ctx,
      renderer,

      controls = {},

    //  game,
      map,
      sprites,
      player;

  const KEYCODES = {SPACE: 32, LEFT: 37, UP: 38, RIGHT: 39, DOWN: 40, ENTER: 13, ESCAPE: 27, TILDE: 192};

  /**
   * Executes all initialization functions and then runs the main game loop.
   */
  this.go = function() {

    loadGameData()
      .then(initializeObjects)
      .then(globalizeObjects)
  //    .then(setupCanvas)
  //    .then(hideWaitMessage)
      .catch(showErrorMessage);

  };


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

  /**
   * Initializes core game objects.
   */
  function initializeObjects(gameData) {
  //  renderer = new Renderer(config);
  //  sprites = new Sprites(spritesData);
  //  map = new GameMap(mapData, mapEntitiesData, config, sprites);
  //  player = new Player(config.player, config.tileSize, config.scale, sprites);
  }


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


  /**
   * Globalizes some the key objects for development purposes.
   */
  function globalizeObjects() {
    if (config.debug !== true) return false;

    window._game = game;
    window._map = map;
    window._player = player;
    window._renderer = renderer;
    window._sprites = sprites;
  }

  this.keyListener = function(event, key, isDown) {
    console.log(key)
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

  /**
   * Determines the actual tile size (which may or may not be less than the
   *     base tile size specified in the configuration.)
   * @param  {number} baseSize - Base tile size.
   * @return {number} Actual tile size to be used.
   */
  function getTileSize(baseSize) {
    return baseSize;
  }

  /**
   * Runs a cycle which involves the following:
   *     (1) update the game state,
   *     (2) enable necessary renderers,
   *     (3) draw the current frame on the canvas.
   */
  function frameLoop() {

  }

  function timestamp() {
    if (window.performance && window.performance.now)
      return window.performance.now();
    else
      return new Date().getTime();
  }

  function resizeCanvas() {
    const viewport = {
      width: document.getElementsByTagName('body')[0].clientWidth,
      height: window.innerHeight,
    };

    canvas.width = viewport.width;
    canvas.height = viewport.height;
  }

  function setupCanvas() {
    canvas = document.getElementById(config.canvasID);
    ctx = canvas.getContext('2d');
  }

};








function _initialize(config) {

  let data = {};  // Object for importing external json data;

  loadDataFiles([config.spritesData, config.mapData, config.mapEntitiesData], data)
    .then(() => initializeObjects(data[config.mapData], data[config.mapEntitiesData], data[config.spritesData]))
    .then(setupCanvas)
    .then(() => hideWaitMessage(config.initMessageID))
    .then(() => frameLoop())
    .catch(error => showErrorMessage(error, config.errorMessageID, config.debug));

  /*----------------------------------------------------------------------*/
  /*----------------------------------------------------------------------*/

  function _initializeObjects(mapData, mapEntitiesData, spritesData) {

    config.tileSize = getTileSize(config.baseTileSize);
    config.scale = config.tileSize / config.baseTileSize;

    step = 1 / config.FPS;

    renderer = new Renderer(config);
    sprites = new Sprites(spritesData);
    map = new GameMap(mapData, mapEntitiesData, config, sprites);
    player = new Player(config.player, config.tileSize, config.scale, sprites);

    if (config.debug === true) globalizeObjects();

    return sprites.loadImages(config.spritesDir); // Returns promise
  };



};
