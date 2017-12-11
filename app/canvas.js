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

  let previousRendererState = Object.assign({}, rendererState);

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
  this.drawFrame = function(activeRenderers, controls, game, map, player) {

    // Clear the whole canvas:
    this.ctx.clearRect(0, 0, this.element.width, this.element.height);

    this.ctx.fillStyle = '#6bc2d8';
    this.ctx.fillRect(0, 0, this.element.width, this.element.height);

    // Run each of the renderers whose state is set to active:
    for (let type in rendererState) {
      if (rendererState.hasOwnProperty(type) && rendererState[type] === true) {

        // Specifies if the renderer has been enabled in this particular frame cycle:
        const isJustEnabled = !previousRendererState[type];

        // Run the renderer:
        renderers[type](this.ctx, scale, controls, game, map, player);
      }
    }
  };


}
