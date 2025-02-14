export default class BackgroundLayer {

/*----------------------------------------------------------------------------*/

  constructor(props, map, scale) {

    // layer properties from configuration
    this.stickToBottom = props.stickToBottom;
    this.repeatHorizontally = props.repeatHorizontally;
    this.marginLeft = props.marginLeft * scale;

    this.actualImageDimensions = {
      width: props.dimensions[0],
      height: props.dimensions[1]
    };

    /* How fast the background moves relative to the map. E.g.,
     * 1:   as fast as the map;
     * 0.5: half as fast as the map;
     * 2:   twice as fast as the map.
    */
    this.slidingSpeed = {
      x: props.speed[0],
      y: props.speed[1]
    };

    this.sprite = props.image;


    /* These dimensions will be used for calculating background position;
     * note that they can be different from the actual image dimensions.
     */
    this.width = this.actualImageDimensions.width + this.marginLeft;
    this.height = this.actualImageDimensions.height;

    /* If necessary, extend the "virtual" background height so that in the
     * bottommost position of the viewport (i.e. when displaying the far bottom edge
     * of the map), the bottom edge of the background image matches the bottom
     * edge of the vieport.
     * The formula seems a bit convoluted, but it works :)
     */
    if (this.stickToBottom) {
        this.height = ( (map.height.px - map.viewport.height.px) * this.slidingSpeed.y ) + map.viewport.height.px;
        this.height = this.height * (1/scale);
    }

    this.offset = {
      x: this.width - this.actualImageDimensions.width,
      y: this.height - this.actualImageDimensions.height
    };

  }

/*----------------------------------------------------------------------------*/

  getSprite(mapOffset, scale, map, viewport) {

    // Calculate the coordinates of the background relative to the current map position:
    let x = mapOffset.x * (1/scale) * this.slidingSpeed.x,
        y = mapOffset.y * (1/scale) * this.slidingSpeed.y;

    /* Calculate the coordinates of the currently visible portion of the background,
     * but only if the background repeat option is enabled. Otherwise, the subsequent
     * (repeated) portions of the background are not displayed anyway.
     */
    if (this.repeatHorizontally) x = x % this.width;

    /* The point (relative to the current viewport) where the currently visible
     * background portion ends horizontally.
     */
    let xEnd = this.width * scale - x * scale;

    /* Check if that point is visible on the screen (if so, the renderer will
     * need to repeat the background starting from that exact point)
     */
    let repeatX;
    if ( !this.repeatHorizontally || xEnd > viewport.width ) repeatX = false;
    else repeatX = xEnd;

    x = x - this.offset.x;
    y = y - this.offset.y;

    const sprite = this.actualImageDimensions;

    return {
      image: this.sprite,
      x: x,// - this.offset.x,
      y: y,// - this.offset.y,
      repeatX: repeatX,
      sX: x,
      sY: ( y < 0 ? 0 : y),
      sWidth: viewport.width,
      sHeight: viewport.height,
      dX: 0,
      dY: ( y < 0 ? -y : 0),
      dWidth: viewport.width,
      dHeight: viewport.height
    };
  }

/*----------------------------------------------------------------------------*/

}
