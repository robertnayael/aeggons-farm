/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*****************************************************************/ //(function() {

/******************************************************************************/

var TILE_SIZE = 70,
    FACTOR = TILE_SIZE / 70,
    VIEWPORT_WIDTH = 20,
    VIEWPORT_HEIGHT = 9,
    FPS = 60,
    STEP = 1 / FPS,
    CANVAS = document.getElementById('canvas'),
    //
CTX = CANVAS.getContext('2d'),
    // move these to initialize()
INIT_MESSAGE = document.getElementById('init-message'),
    //
KEYCODES = { SPACE: 32, LEFT: 37, UP: 38, RIGHT: 39, DOWN: 40, ENTER: 13, ESCAPE: 27, TILDE: 192 },
    WAIT_ON_STATE_CHANGE = 3000,
    CONFIG_FILE = 'data/config.json',
    SPRITES_FILE = 'data/sprites.json',
    MAP_FILE = 'data/map.json',
    SPRITES_DIR = './sprites/';

CANVAS.width = VIEWPORT_WIDTH * TILE_SIZE;
CANVAS.height = VIEWPORT_HEIGHT * TILE_SIZE;

var controls = {};

/******************************************************************************/

function timestamp() {
  if (window.performance && window.performance.now) return window.performance.now();else return new Date().getTime();
}

var delta = 0,
    // delta between now and last
now = void 0,
    last = timestamp();

function frameLoop() {
  now = timestamp(); // time at the start of this loop
  delta = delta + Math.min(1, (now - last) / 1000);
  while (delta > STEP) {
    // make sure the game catches up if the delta is too high
    delta = delta - STEP;
    //gameLoop(STEP);
    game.run(STEP);
  }
  renderer.drawFrame(CTX, delta);
  last = now; // time at the start of the previous loop
  requestAnimationFrame(frameLoop, CANVAS);
}

/*******************************************************************************
| Main objects
*******************************************************************************/

var settings, map,
//assets,
renderer, player, sprites;

/******************************************************************************/

function onkey(event, key, isDown) {
  switch (key) {
    case KEYCODES.LEFT:
      controls.left = isDown;return false;
    case KEYCODES.RIGHT:
      controls.right = isDown;return false;
    case KEYCODES.SPACE:
      controls.jump = isDown;return false;
    case KEYCODES.UP:
      controls.jump = isDown;return false;
    case KEYCODES.ENTER:
      controls.accept = isDown;return false;
    case KEYCODES.ESCAPE:
      controls.exit = isDown;return false;
    case KEYCODES.TILDE:
      controls.debug = isDown;return false;
  }
};

/******************************************************************************/

//document.addEventListener('keydown', function(event) { return onkey(event, event.keyCode, true);  }, false);
//document.addEventListener('keyup', function(event) { return onkey(event, event.keyCode, false);  }, false);

//document.addEventListener("DOMContentLoaded", initialize());


//})();/*************************************************************************/

/***/ })
/******/ ]);