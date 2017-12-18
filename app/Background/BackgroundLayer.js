export default class BackgroundLayer {

/*----------------------------------------------------------------------------*/

  constructor(filename, speed) {

    this.width = 500;
    this.height = 300;

    // mock properties
    this.slidingSpeed = {
      x: speed,
      y: 0.2
    };

    fetch(filename)
      .then(response => response.blob())
      .then(blob => {
        const url = URL.createObjectURL(blob);
        this.sprite = new Image();
        this.sprite.src = url;
      });
  }

/*----------------------------------------------------------------------------*/

  getSprite(mapOffset, scale, map, viewport) {

    let x = mapOffset.x * (1/scale) * this.slidingSpeed.x,
        y = mapOffset.y * (1/scale) * this.slidingSpeed.y;

    x = x % this.width;

    let xEnd = this.width * scale - x * scale;  // The point (relative to the current viewport) where the background ends horizontally

    let repeatX;
    if (xEnd > viewport.width ) repeatX = false;
    else repeatX = xEnd;

    return {
      image: this.sprite,
      x: x,
      y: y,
      repeatX: repeatX
    };
  }

/*----------------------------------------------------------------------------*/

}
