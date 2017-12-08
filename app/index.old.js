import "es6-promise/auto";
import 'isomorphic-fetch';

import config from './config';
import game from './game';
import {onkey} from './keylistener';
import GameMap from './map';
import Player from './player';
import Sprites from './sprites';
import {Renderer} from './renderer';

/**************************************************************************/

function timestamp() {
  if (window.performance && window.performance.now)
    return window.performance.now();
  else
    return new Date().getTime();
}

/*------------------------------------------------------------------------*/

let delta = 0,                                   // delta between now and last
    now,
    last = timestamp(),
    step,
    canvas,
    ctx,
    activeRenderers;

/*------------------------------------------------------------------------*/

function frameLoop() {
  now = timestamp();                            // time at the start of this loop
  delta = delta + Math.min(1, (now - last) / 1000);
  while(delta > step) {                         // make sure the game catches up if the delta is too high
    delta = delta - step;
    activeRenderers = game.run(step, config, controls, sprites, map, player);
  }
  renderer.register(activeRenderers);
  renderer.drawFrame(activeRenderers, ctx, canvas, controls, game, map, player);
  last = now;                                   // time at the start of the previous loop
  requestAnimationFrame(frameLoop, canvas);

}

/**************************************************************************/

let map,
    renderer,
    player,
    sprites;

/**************************************************************************/

function initialize(config) {

  let data = {};  // Object for importing external json data;

  loadDataFiles([config.spritesData, config.mapData, config.mapEntitiesData], data)
    .then(() => initializeObjects(data[config.mapData], data[config.mapEntitiesData], data[config.spritesData]))
    .then(setupCanvas)
    .then(() => hideWaitMessage(config.initMessageID))
    .then(() => frameLoop())
    .catch(error => showErrorMessage(error, config.errorMessageID, config.debug));

  /*----------------------------------------------------------------------*/

  function loadDataFiles(filelist, contents) {

    const fetchFile = file => fetch(file)
      .then(
        function(response) {
          if (response.status >= 200 && response.status < 300) {
            return Promise.resolve(response);
          } else {
            return Promise.reject(new Error(response.statusText));
          }
        }
      )
      .then(response => response.json())
      .then(json => ( contents[file] = json ));

    return Promise
      .all(filelist.map(fetchFile));

  };

  /*----------------------------------------------------------------------*/

  function hideWaitMessage(id) {
    const waitMessage = document.getElementById(id);
    waitMessage.style.display = 'none';
  };

  /*----------------------------------------------------------------------*/

  function showErrorMessage(error, id, debug) {
    const errorMessage = document.getElementById(id);
    errorMessage.style.display = 'block';

    if(debug) console.error(error);
  }

  /*----------------------------------------------------------------------*/

  function initializeObjects(mapData, mapEntitiesData, spritesData) {

    config.tileSize = getTileSize(config.baseTileSize);
    config.scale = config.tileSize / config.baseTileSize;

    step = 1 / config.FPS;
  /*  canvas = document.getElementById(config.canvasID);
    ctx = canvas.getContext('2d');
    canvas.width = config.viewportWidth * config.tileSize;
    canvas.height = config.viewportHeight * config.tileSize;*/

    renderer = new Renderer(config);
    sprites = new Sprites(spritesData);
    map = new GameMap(mapData, mapEntitiesData, config, sprites);
    player = new Player(config.player, config.tileSize, config.scale, sprites);

    if (config.debug === true) globalizeObjects();

    return sprites.loadImages(config.spritesDir); // Returns promise
  };

  /*----------------------------------------------------------------------*/

  // Globalize some the key objects for development purposes
  function globalizeObjects() {
    window._game = game;
    window._map = map;
    window._player = player;
    window._renderer = renderer;
    window._sprites = sprites;
  }

  /*----------------------------------------------------------------------*/

  function getTileSize(baseSize) {
    return baseSize;
  }

};

/**************************************************************************/

function setupCanvas() {
  canvas = canvas ? canvas : document.getElementById(config.canvasID);
  ctx = ctx ? ctx : canvas.getContext('2d');

  const viewport = {
    width: document.getElementsByTagName('body')[0].clientWidth,
    height: window.innerHeight,
  };

  canvas.width = viewport.width;
  canvas.height = viewport.height;

  console.log(canvas.height);
}

/**************************************************************************/

var controls = {};
document.addEventListener('keydown', function(event) { return onkey(event, event.keyCode, true, controls);  }, false);
document.addEventListener('keyup', function(event) { return onkey(event, event.keyCode, false, controls);  }, false);
document.addEventListener("DOMContentLoaded", initialize.bind(this, config));
window.addEventListener("resize", setupCanvas);
