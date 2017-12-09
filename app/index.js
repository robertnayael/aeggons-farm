import config from './config';
import GameController from './GameController';

const controller = new GameController(config);
document.addEventListener("DOMContentLoaded", controller.go);
