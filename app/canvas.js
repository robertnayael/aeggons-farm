import WelcomeScreen from './renderers/WelcomeScreen';
import Gameplay from './renderers/Gameplay';
import DebugInfo from './renderers/DebugInfo';
import GameplayIntro from './renderers/GameplayIntro';
import GameOver from './renderers/GameOver';
import GameWon from './renderers/GameWon';

export default function Canvas (config, overlayLayers) {

  // Each property reflects the state of the respective rendering method (true: enabled, false: disabled).
  const rendererState = {
    welcomeScreen: false,
    gameplay: false,
    debugInfo: true,
    gameplayIntro: false,
    gameOver: false,
    gameWon: false,
  };

  let previousRendererState = Object.assign({}, rendererState);

  const tileSize = config.tileSize;
  const scale = config.scale;
  const overlays = overlayLayers;

  /****************************************************************************/

  this.initialize = function(sprites) {

    this.setupCanvasElement();

    const args = {
      sprites,
      canvas: {
        width: this.element.width,
        height: this.element.height,
        ctx: this.ctx
      }
    };

    this.renderers = {
      welcomeScreen: new WelcomeScreen (overlays['welcomeScreen'], args),
      gameplay:      new Gameplay      (overlays['gameplay'], args),
      debugInfo:     new DebugInfo     (overlays['debugInfo'], args),
      gameplayIntro: new GameplayIntro (overlays['gameplayIntro'], args),
      gameOver:      new GameOver      (overlays['gameOver'], args),
      gameWon:       new GameWon       (overlays['gameWon'], args)
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

        this.renderers[type].render(this.ctx, justEnabled, scale, stateData);
      }
    });

    this.ctx.restore();
  };

/******************************************************************************/

}
