import WelcomeScreen from './renderers/WelcomeScreen';
import Gameplay from './renderers/Gameplay';
import DebugOverlay from './renderers/DebugOverlay';
import GameplayIntroOverlay from './renderers/GameplayIntroOverlay';
import GameOverOverlay from './renderers/GameOverOverlay';
import GameWonOverlay from './renderers/GameWonOverlay';

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

  let previousRendererState = Object.assign({}, rendererState);

  const tileSize = config.tileSize;
  const scale = config.scale;

  /****************************************************************************/

  this.initialize = function(overlayLayers, gameObjects) {

    this.setupCanvasElement();

    this.renderers = {
      welcomeScreen: new WelcomeScreen(),
      gameplay: new Gameplay(),
      debugOverlay: new DebugOverlay(),
      gameplayIntro: new GameplayIntroOverlay(),
      gameOverOverlay: new GameOverOverlay(),
      gameWonOverlay: new GameWonOverlay()
    };

  };

  /*****************************************************************************
  |
  */
  this.setupCanvasElement = function() {
    this.element = document.getElementById(config.canvasID);
    this.ctx = canvas.getContext('2d');

    this.resize();
  };

  /*****************************************************************************
  |
  */
  this.resize = function() {
    const canvas = this.element;

    const base = {
      width: config.viewportWidth * tileSize,
      height: config.viewportHeight * tileSize
    },

    client = {
      width: document.getElementsByTagName('body')[0].clientWidth,
      height: window.innerHeight
    },

    scale = {
      horizontal: Math.min(1, client.width / base.width),
      vertical: Math.min(1, client.height / base.height)
    },

    factor = Math.min(scale.horizontal, scale.vertical),

    margin = {
      top: (client.height - base.height * factor) / 2,
      left: (client.width - base.width * factor) / 2
    };

    this.element.width = base.width;
    this.element.height = base.height;

    this.element.style.width = base.width * factor + 'px';
    this.element.style.height = base.height * factor + 'px';

    this.element.style.marginTop = margin.top + 'px';
    this.element.style.marginLeft = margin.left + 'px';
  };

  /*****************************************************************************
  |
  */
  this.registerRenderers = function(activeRenderers) {

    // Store the previous state:
    previousRendererState = Object.assign({}, rendererState);

    // Deregister all renderers except debugOverlay:
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
  this.drawFrame = function(activeRenderers, stateData) {

    // Clear the whole canvas:
    this.ctx.clearRect(0, 0, this.element.width, this.element.height);

    this.ctx.fillStyle = '#6bc2d8';
    this.ctx.fillRect(0, 0, this.element.width, this.element.height);

    this.ctx.save();

    // Run each of the renderers whose state is currently set as active:
    Object.keys(this.renderers).forEach(type => {
      if (rendererState[type] === true) {

        /* Specifies if the renderer has been enabled in the current frame cycle.
         * This tells the renderer whether it should initiate transition effects
         * (e.g. fade-in effect when the game state changes from 'welcomeScreen'
         * to 'gameplayIntro'). */
        const justEnabled = !previousRendererState[type];

        this.renderers[type].draw(this.ctx, justEnabled, scale, stateData);
      }
    });

    this.ctx.restore();
  };

/******************************************************************************/

  this.setScreenOverlayLayers = function(layers) {
    this.screenOverlayLayers = layers;
  };

}
