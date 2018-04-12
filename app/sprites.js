import ProgressBar from './ProgressBar';

export default class Sprites {

  constructor(props) {
    this.filelist = props.FILELIST; // Filenames of the images to be loaded
    this.images = {};               // All image objects will be stored here

    this.spritemaps = {
      'player': props.player,
      'mobs': props.mobs,
      'platforms': props.platforms,
      'collectibles': props.collectibles,
      'mapTiles': props.mapTiles,
      'infoSigns': props.infoSigns,
      'specialObjects': props.specialObjects,
      'decorations': props.decorations,
      'score': props.score,
      "background": props.background,
      "screenOverlays": props.screenOverlays
    };

    this.memoizedData = new Map();
  }

/******************************************************************************/

  getSpriteProps(variantID, firstFrame = 0) {

    // Get the sub-key of the spritemaps object:
    let props = this.spritemaps;
    variantID.forEach(key => {
      if (!props[key]) throw new Error(`Sprite not found: < ${variantID.join(' // ')} >`);
      props = Object.assign({}, props[key]);
    });

    return {
      props: props,
      firstFrame: firstFrame
    };
  }

/******************************************************************************/

  getbackgroundSprites() {
    return this.spritemaps.background.map(layer => {
      return Object.assign(layer, {image: this.images[layer.image]});
    });
  }

/******************************************************************************/

  getSprite(spriteType) {

    const spriteID = spriteType.join('.');

    if (this.memoizedData.has(spriteID)) {
      return this.memoizedData.get(spriteID);
    }

    const {props} = this.getSpriteProps(spriteType);

    const spriteData = Object.assign(props, {
      image: this.images[props.image],
      width: props.dimensions[0],
      height: props.dimensions[1],
      drawOffsetX: props.drawOffset[0],
      drawOffsetY: props.drawOffset[1],
      x: props.coords[0],
      y: props.coords[1]
    });

    this.memoizedData.set(spriteID, spriteData);

    return spriteData;
  }

/******************************************************************************/

  getFrameIteratorNoLoop(spriteType, frame = 0) {
    return this.getFrameIterator(spriteType, frame, false);
  }

/******************************************************************************/

  getFrameIterator(spriteType, frame = 0, loop = true) {

    // Sprite properties:
    const {props, firstFrame} = this.getSpriteProps(spriteType, frame);

    // Number of frames:
    const frames = props.frames;

    const spritePropertiesPartial = {
      image: this.images[props.image],
      width: props.dimensions[0],
      height: props.dimensions[1],
      drawOffsetX: props.drawOffset[0],
      drawOffsetY: props.drawOffset[1],
    };

    return this.frameIterator(frames, firstFrame, spritePropertiesPartial, loop);
  }

/******************************************************************************/

  *frameIterator(frames, firstFrame, propertiesPartial, loop) {
    let index = firstFrame < frames.length
      ? firstFrame
      : 0;

    while (index < frames.length) {
      const i = index;
      index++;

      const frame = {
        ...propertiesPartial,
        x: frames[i][0],
        y: frames[i][1]
      };

      if (index === frames.length) {
        if (!loop) return frame;
        index = 0;
      }

      yield frame;
    }
  }

/******************************************************************************/

  loadImages(spritesDir, progressBarParent) {

    const makeImage = (filename, blob) => {
      const url = URL.createObjectURL(blob);
      const image = new Image();
      image.src = url;
      this.images[filename] = image;
    };

    const progressBar = new ProgressBar({
      parentElement: progressBarParent,
      classModifier: 'images',
      label: 'loading image assets',
      steps: this.filelist.length
    });

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
      .then(blob => makeImage(file, blob))
      .then(() => progressBar.increase());

    return Promise
      .all(this.filelist.map(fetchFile));
  }

/******************************************************************************/

}
