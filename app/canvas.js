import welcomeScreen from './renderers/welcomeScreen';
import gameplay from './renderers/gameplay';
import debugOverlay from './renderers/debugOverlay';
import gameplayIntro from './renderers/gameplayIntro';
import gameOverOverlay from './renderers/gameOverOverlay';
import gameWonOverlay from './renderers/gameWonOverlay';

export default function Canvas (config) {

  // Each property reflects the state of the respective rendering method (true: enabled, false: disabled).
  const rendererState = {
    welcomeScreen: false,
    gameplay: false,
    debugOverlay: true,
    gameplayIntro: false,
    gameOverOverlay: false,
    gameWonOverlay: false,
  };

  const renderers = {
    welcomeScreen: welcomeScreen,
    gameplay: gameplay,
    debugOverlay: debugOverlay,
    gameplayIntro: gameplayIntro,
    gameOverOverlay: gameOverOverlay,
    gameWonOverlay: gameWonOverlay
  };

  const tileSize = config.tileSize;
  const scale = config.scale;

  /*****************************************************************************
  |
  */
  this.setupCanvasElement = function() {
    this.element = document.getElementById(config.canvasID);
    this.ctx = canvas.getContext('2d');

    this.resizeCanvas();
  };

  /*****************************************************************************
  |
  */
  this.resizeCanvas = function() {
    const viewport = {
      width: document.getElementsByTagName('body')[0].clientWidth,
      height: window.innerHeight,
    };

    this.element.width = viewport.width;
    this.element.height = viewport.height;
  };

  /*****************************************************************************
  |
  */
  this.registerRenderers = function(activeRenderers) {

    // First, deregister all renderers except debugOverlay:
    for (let property in rendererState) {
      if (rendererState.hasOwnProperty(property) && property !== 'debugOverlay') {
        rendererState[property] = false;
      }
    }

    activeRenderers.forEach(renderer => {
      if (rendererState.hasOwnProperty(renderer)) {
        rendererState[renderer] = true;
      }
    });
  };

  /*****************************************************************************
  | Fires all active renderers. This method is called on each cycle
  | from within the frame loop.
  */
  this.drawFrame = function(activeRenderers, controls, game, map, player) {

    // Clear the whole canvas:
    this.ctx.clearRect(0, 0, this.element.width, this.element.height);

    this.ctx.fillStyle = '#6bc2d8';
    this.ctx.fillRect(0, 0, this.element.width, this.element.height);

    for (let type in rendererState) {
      if (rendererState.hasOwnProperty(type) && rendererState[type] === true) {
        renderers[type](this.ctx, controls, game, map, player);
      }
    }
  };


}
