import BackgroundLayer from './BackgroundLayer';

export default class Background {

  constructor() {

    let mockLayer = new BackgroundLayer('../sprites/background1.png', 0.4);
    let mockLayer2 = new BackgroundLayer('../sprites/background2.png', 0.55);

    this.layers = [
      mockLayer,
      mockLayer2
    ];
  }

}
