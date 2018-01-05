import * as effectFactory from './transitions';

export default class Renderer {

/*----------------------------------------------------------------------------*/

  /**
   * @param  {Array} overlays = [] - overlay data
   * @param  {Object} sprites      - sprites object handler
   * @param  {Object} canvas       - canvas info
   */
  constructor(overlayProps = [], {sprites, canvas}) {

    this.overlayFactory = this.makeOverlays.bind(this, overlayProps, sprites, canvas);
    this.overlays = this.overlayFactory();

  }

/*----------------------------------------------------------------------------*/

  makeOverlays(overlayProps, sprites, canvas) {
    const overlayPropsComplete = this.assignOverlayContent(this.groupOverlays(overlayProps), sprites);
    return this.getOverlayFunctions(overlayPropsComplete, effectFactory, sprites, canvas);
  }

/*----------------------------------------------------------------------------*/
  /**
   * assignOverlayContent - Determines the type and payload of each overlay layer
   *                            and assigns that info to the layer data.
   *
   * @param  {Array} overlays - overlay data
   * @param  {Object} sprites - sprites object handler
   * @return {Array}          - updated overlay data
   */
  assignOverlayContent(overlays, sprites) {
    return overlays.map(group => {
      group.map(overlay => {

        if(overlay.color) {
          overlay.content = {
            type: 'SOLID_COLOR',
            color: overlay.color
          };
        }
        else if(overlay.spriteName && overlay.animated) {
          overlay.content = {
            type: 'ANIMATION',
            position: overlay.position,
            frameIterator: sprites.getFrameIterator(['screenOverlays', overlay.spriteName])
          };
        }
        else if(overlay.spriteName && !overlay.animated) {
          overlay.content = {
            type: 'SPRITE',
            position: overlay.position,
            sprite: sprites.getSprite(['screenOverlays', overlay.spriteName])
          };
        }
        return overlay;

      });
      return group;
    });
  }

/*----------------------------------------------------------------------------*/
  /**
   * @param  {Array} overlayProps   - overlay data
   * @param  {Object} effectFactory - factory functions for transition effects
   * @param  {Object} sprites       - sprites object handler
   * @param  {Object} canvas        - canvas properties (dimensions & context handler)
   * @return {Array}                - functions for drawing overlays
   */
  getOverlayFunctions(overlayProps, effectFactory, sprites, canvas) {

    return overlayProps.map(group => {
      return group.map(overlay => {

        if (overlay.transition) {
          return this.createTransitionEffect(
            overlay.transition.type,
            overlay.transition.props,
            overlay.content,
            canvas
          );
        }
        return null;

      });
    });
  }

/*----------------------------------------------------------------------------*/

  createTransitionEffect(effect, ...args) {
    switch(effect) {
      case 'fade-in': return effectFactory.fadeIn(...args);
      case 'fade-out': return effectFactory.fadeOut(...args);
      case 'circle-in': return effectFactory.circleIn(...args);
      case 'circle-out': return effectFactory.circleOut(...args);
      case 'pulse': return effectFactory.pulse(...args);
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

  makeNewOverlays() {
    this.overlays = this.overlaysBlueprint.map(group => {
      return group.map(overlay => {
        if (overlay instanceof Function) return overlay.bind(null);
      });
    });
  }

/*----------------------------------------------------------------------------*/

  applyOverlays(startFromScratch = false) {

    // If necessary, make brand-new overlay functions:
    if (startFromScratch) this.overlays = this.overlayFactory();

    this.overlays.some(group => {

    /*  let allFinished = true;
      group.forEach(overlay => {

        if (overlay instanceof Function) allFinished = overlay() && allFinished;

      });*/

      const allFinished = group.reduce((allFinished, overlay) => {
        if (overlay instanceof Function) {
          const thisFinished = overlay();
          return allFinished && thisFinished;
        }
      }, true);


      /* This will return true as long as any overlay within the group still
       * hasn't finished its transition effect, breaking the some() loop: */
      return !allFinished;

    });
  }

/*----------------------------------------------------------------------------*/
  /**
   * @param  {CanvasRenderingContext2D} ctx - Canvas context.
   * @param  {boolean}          justEnabled - Whether the renderer has been
   *                                          enabled in this particular frame
   * @param  {number}                 scale - Rendering scale (1 = normal scale)
   * @param  {Object}             stateData - Information on the current state
   *                                          of the game and its entities.
   */
  render(ctx, justEnabled, scale, stateData) {
    this.applyOverlays(justEnabled);
    this.draw(ctx, scale, stateData);
  }

/*----------------------------------------------------------------------------*/

  draw(ctx, scale, stateData) {

  }

/*----------------------------------------------------------------------------*/
}
