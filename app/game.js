import GameMap from './GameMap';
import Player from './entities/Player';
import Sprites from './Sprites';

export default {

/******************************************************************************/

  state: 'initialization',
  stateChanged: null,
  controlsLocked: null,

/******************************************************************************/

  bootstrap: function({config, gameData}) {
    config.scale = 1; // to be removed completely

    this.sprites = new Sprites(gameData['sprites']);
    this.map = new GameMap(gameData['map'], gameData['entities'], gameData['mobTypes'], config, this.sprites);
    this.player = new Player(config.player, config.tileSize, config.scale, this.sprites);

    return this.sprites.loadImages(config.spritesDir) // This one's important as it takes quite a while to load all images; returns a Promise
      .then(() => this.map.initializeBackground());
  },

/******************************************************************************/

  run: function(step, config, controls) {

    const {sprites, map, player} = this;

    const props = this[this.state](config, controls, map, player);
    const defaultNextState = props.nextState;
    let nextState;

    // Update (move) all entities on the map
    if (props.updateEntities) {
      map.updateEntities(step);
      nextState = player.update({step, controls, map});
    }

    map.updateVisibilityRange(player);

    // Update the game state if necessary:
    this.changeState(nextState ? nextState : defaultNextState);

    // This will be returned to the frame loop function to determine what
    // should be drawn on the canvas.
    return props.renderers;
  },

/******************************************************************************/

  changeState: function(newState) {

    if (!newState || (newState === this.state))
      return false;

    this.state = newState;
    this.stateChanged = new Date().getTime();
  },

/******************************************************************************/

  initialization: function(config, controls, map, player) {

    player.initialize({
      tileSize: config.tileSize,
      scale: config.scale
    });

    map.initializeEntities(config.tileSize, config.scale);

    return {
      nextState: 'welcomeScreen',
      renderers: [],
      updateEntities: false,
      controlsLocked: false
    };
  },

/******************************************************************************/

  welcomeScreen: function(config, controls) {

    let props = {
      renderers: ['welcomeScreen'],
      updateEntities: false,
      controlsLocked: false
    };

    if(controls.accept)              // The user pressed <ENTER> while in the welcome screen; start the game
      props.nextState = 'gameplayIntro';

    return props;
  },

/******************************************************************************/

  gameplayIntro: function(config) {

    let props = {
      renderers: ['gameplay', 'gameplayIntro'],
      updateEntities: true,
      controlsLocked: true
    };

    let waitFinished = (this.stateChanged + config.waitOnGameStateChange < new Date().getTime());

    if (waitFinished)
      props.nextState = 'gameplay';

    return props;
  },

/******************************************************************************/

  gameplay: function(config, controls) {

    let props = {
      nextState: 'gameplay',
      renderers: ['gameplay'],
      updateEntities: true,
      controlsLocked: false
    };

    if (controls.exit)               // Return to the welcome screen on <ESC>
      props.nextState = 'initialization';

    return props;
  },

/******************************************************************************/

  playerGotHit: function(config) {

    let props = {
      nextState: 'playerGotHit',
      renderers: ['gameplay', 'playerGotHit'],
      updateEntities: true,
      controlsLocked: true
    };

    let waitFinished = (this.stateChanged + config.waitOnGameStateChange < new Date().getTime());

    if (waitFinished) {
      props.nextState = 'gameplay';
    }

    return props;
  },

/******************************************************************************/

  gameOver: function(config, controls) {

    let props = {
      renderers: ['gameplay', 'gameOver'],
      updateEntities: true,
      controlsLocked: true
    };

    if (controls.accept || controls.exit)
      props.nextState = 'initialization';

    return props;
  },

/******************************************************************************/

  gameWon: function(config, controls) {

    let props = {
      renderers: ['gameplay', 'gameWon'],
      updateEntities: true,
      controlsLocked: true
    };

    if (controls.accept || controls.exit)
      props.nextState = 'initialization';

    return props;
  },

/******************************************************************************/

};
