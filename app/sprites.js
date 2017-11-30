export default class Sprites {

  constructor(props) {
    this.filelist = props.FILELIST; // Filenames of the images to be loaded
    this.images = {};               // All image objects will be stored here

    this.spritemaps = {
      'player': props.player,
      'mobs': props.mobs,
      'mapTiles': props.mapTiles
    };
  }

/******************************************************************************/

  getSprite(type, variant, defaultVariant = false) {

    // TODO: add default variant handler

    const props = this.spritemaps[type][variant];

    return {
      image: this.images[props.image],
      width: props.dimensions[0],
      height: props.dimensions[1],
      drawOffsetX: props.drawOffset[0],
      drawOffsetY: props.drawOffset[1],
      x: props.coords[0],
      y: props.coords[1]
    };
  }

/******************************************************************************/

  getFrameIterator(type, animationVariant, firstFrame) {

    // Animation properties:
    const props = this.spritemaps[type][animationVariant],

    // Number of Frames:
    frames = props.frames,

    spritePropertiesPartial = {
      image: this.images[props.image],
      width: props.dimensions[0],
      height: props.dimensions[1],
      drawOffsetX: props.drawOffset[0],
      drawOffsetY: props.drawOffset[1],
    };

    return this.frameIterator(frames, firstFrame, spritePropertiesPartial);
  }

/******************************************************************************/

  *frameIterator(frames, firstFrame, propertiesPartial) {

    let index = firstFrame;
    while (index < frames.length) {

      let i = index;
      index++;

      if (index === frames.length) index = 0;

      yield Object.assign({
        x: frames[i][0],
        y: frames[i][1]},
      propertiesPartial);

    }
  }

/******************************************************************************/

  loadImages(spritesDir) {

    const makeImage = (filename, blob) => {
      const url = URL.createObjectURL(blob);
      const image = new Image();
      image.src = url;
      this.images[filename] = image;
    };

    const fetchFile = file => fetch(spritesDir + file)
      .then(
        function(response) {
          if (response.status >= 200 && response.status < 300) {
            return Promise.resolve(response);
          } else {
            return Promise.reject(new Error(response.statusText));
          }
        }
      )
      .then(response => response.blob())
      .then(blob => makeImage(file, blob));

    return Promise
      .all(this.filelist.map(fetchFile));
  }

/******************************************************************************/

}
