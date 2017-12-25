import config from './config';
import App from './App';

const app = new App(config);
document.addEventListener("DOMContentLoaded", app.go);
