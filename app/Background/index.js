import BackgroundLayer from './BackgroundLayer';

export default class Background {

  constructor(map, scale) {

  //  let mockLayer = new BackgroundLayer('../sprites/background1.png', 0.4);
  //  let mockLayer2 = new BackgroundLayer('../sprites/background2.png', 0.55);
    let mockLayer3 = new BackgroundLayer('../sprites/background4.png', 1, map, scale);

    this.layers = [
  //    mockLayer,
  //    mockLayer2,
      mockLayer3
    ];
  }

}
