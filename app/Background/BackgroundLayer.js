export default class BackgroundLayer {

/*----------------------------------------------------------------------------*/

  constructor(filename, speed) {

    this.width = 2000;
    this.height = 1000;

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

  getSprite(mapOffset, map, viewport) {

    const x = mapOffset.x * this.slidingSpeed.x,
          y = mapOffset.y * this.slidingSpeed.y,
          xEnd = this.width - x;  // The point (relative to the current viewport) where the background ends horizontally.

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
