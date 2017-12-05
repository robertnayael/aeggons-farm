import welcomeScreen from './renderers/welcomeScreen';
import gameplay from './renderers/gameplay';
import debugOverlay from './renderers/debugOverlay';
import gameplayIntro from './renderers/gameplayIntro';
import gameOverOverlay from './renderers/gameOverOverlay';
import gameWonOverlay from './renderers/gameWonOverlay';

export function Renderer (config) {

  // Each property reflects the state of the respective rendering method (true: enabled, false: disabled).
  let rendererState = {
    welcomeScreen: false,
    gameplay: false,
    debugOverlay: true,
    gameplayIntro: false,
  //  playerGotHitOverlay: false, <--- to be removed
    gameOverOverlay: false,
    gameWonOverlay: false,
  };
  const renderers = {}; // This stores all the rendering methods (declared later on)

  const tileSize = config.tileSize;
  const scale = config.scale;

  /*****************************************************************************
  |
  */
  this.register = function(activeRenderers) {

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
  this.drawFrame = function(activeRenderers, ctx, canvas, controls, game, map, player) {

    // Clear the whole canvas:
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#6bc2d8';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let type in rendererState) {
      if (rendererState.hasOwnProperty(type) && rendererState[type] === true) {
        renderers[type](ctx, controls, game, map, player);
      }
    }
  };

  /*****************************************************************************
  | The welcome screen, displayed before a new game starts.
  */
  renderers.welcomeScreen = function(ctx) {
    // TODO
  };

  /*****************************************************************************
  | This overlay is drawn on top of the game while the player is waiting to be
  | respawned after losing a life.
  */
  renderers.playerGotHitOverlay = function(ctx) {
    // TODO
    //console.log('1')
  };

  renderers.gameOverOverlay = function(ctx) {
    gameOverOverlay(ctx);
  };

  renderers.gameWonOverlay = function(ctx) {
    // TODO
  };

  renderers.gameplayIntro = function(ctx) {
    // TODO
  };

  renderers.gameplay = function(ctx, controls, game, map, player) {
    gameplay(ctx, controls, game, map, player);
  };

  renderers.debugOverlay = function(ctx, controls, game, map, player) {
    debugOverlay(ctx, controls, game, map, player);
  };

}
