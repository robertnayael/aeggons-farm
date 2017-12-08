import config from './config';
import GameController from './GameController';

const controller = new GameController(config);

document.addEventListener('keydown', event => controller.keyListener(event, event.keyCode, true), false);
document.addEventListener('keyup', event => controller.keyListener(event, event.keyCode, false), false);
//window.addEventListener("resize", controller.resizeCanvas);
document.addEventListener("DOMContentLoaded", controller.go);