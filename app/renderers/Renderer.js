import * as effectFactory from './transitions';

export default class Renderer {

/*----------------------------------------------------------------------------*/

    constructor(overlays = [], sprites) {

      this.sprites = sprites;
      this.overlays = this.assignOverlayContent(this.groupOverlays(overlays), sprites);

    }

/*----------------------------------------------------------------------------*/

  assignOverlayContent(overlays, sprites) {
    overlays.forEach(group => {
      group.forEach(overlay => {

        if(overlay.color) {
          overlay.content = {
            type: 'SOLID_COLOR',
            payload: overlay.color
          };
        }
        else if(overlay.spriteName && overlay.animated) {
          overlay.content = {
            type: 'ANIMATION',
            payload: sprites.getFrameIterator(['screenOverlays', overlay.spriteName])
          };
        }
        else if(overlay.spriteName && !overlay.animated) {
          overlay.content = {
            type: 'SPRITE',
            payload: sprites.getSprite(['screenOverlays', overlay.spriteName])
          };
        }

      });
    });
    return overlays;
  }

/*----------------------------------------------------------------------------*/

    createTransitionEffect(effect, args) {
      switch(effect) {
        case 'fade-in': return effectFactory.fadeIn(args);
        case 'fade-out': return effectFactory.fadeOut(args);
        case 'circle-in': return effectFactory.circleIn(args);
        case 'cirlce-out': return effectFactory.circleOut(args);
      }
    }

/*----------------------------------------------------------------------------*/
    /**
     * groupOverlays      - Turns a flat list of overlay layers into groups of
     *                          layers, each group including layers whose
     *                          transision effect should be completed before
     *                          layers from the next group are drawn.
     *
     *                      Groups are determined based on the special control
     *                          instruction: an object with
     *                          a "WAIT_UNTIL_COMPLETED" boolean value.
     *
     * @param  {Array} layers - One-dimensional array of layers.
     * @return {Array}        - Two-dimensional array of layers; each sub-array
     *                          representing a group of layers.
     */
    groupOverlays(layers) {

      return layers.reduce((groups, layer) => {
        const current = groups.length - 1;

        /* Prepare a new group for subsequent layers: */
        if (layer.WAIT_UNTIL_COMPLETED === true) groups.push([]);

        /* ...or put the current layer in the current group: */
        else groups[current].push(layer);

        return groups;
      }, [[]]);
    }

/*----------------------------------------------------------------------------*/
    /**
     * draw - Default method for drawing on the canvas.
     *
     * @param  {CanvasRenderingContext2D} ctx - Canvas context.
     * @param  {boolean}          justEnabled - Whether the renderer has been
     *                                          enabled in this particular frame
     * @param  {integer}                scale - Rendering scale (1 = normal scale)
     * @param  {Object}             stateData - Information on the current state
     *                                          of the game and its entities.
     */
    draw(ctx, justEnabled, scale, stateData) {

    }

/*----------------------------------------------------------------------------*/
}
