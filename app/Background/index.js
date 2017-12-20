import BackgroundLayer from './BackgroundLayer';

export default class Background {

/*----------------------------------------------------------------------------*/

  constructor(map, scale, layers) {

    this.layers = {
      foreground: [],
      background: []
    };

    if (!Array.isArray(layers)) return;

    layers.forEach(layer => {

      // Set the plane to "foreground" if explicitly stated; otherwise set it to "background":
      const plane = (layer.plane.toLowerCase() === 'foreground' ? 'foreground' : 'background');

      this.layers[plane].push(new BackgroundLayer(layer, map, scale));
    });

  }

/*----------------------------------------------------------------------------*/

  getBackgroundLayers() {
    return this.layers.background;
  }

/*----------------------------------------------------------------------------*/

  getForegroundLayers() {
    return this.layers.foreground;
  }

/*----------------------------------------------------------------------------*/

}
