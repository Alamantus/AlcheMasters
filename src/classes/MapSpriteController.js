import {pixelCoordFromGeoCoord} from '../js/helpers';

export class MapSpriteController {
  constructor (parentObject, compassObject, latitude, longitude, generatedTime) {
    this.parent = parentObject;
    this.parent.anchor.setTo(0.5, 0.5);
    this.parent.scale.setTo(0.5, 0.5);

    this.state = parentObject.game.state.getCurrentState();

    this.compass = compassObject;

    this.generatedTime = generatedTime;

    // Set the initial fade. If in mid-fade, this should set it correctly.
    this.fadeIn();

    // I belive this will only be used for testing! LatLong will likely be distributed based on positions
    // at regular 0.005 (or something like that) global latlong intervals that the player is closest to.
    // const LATLONGMAXDISTANCE = 0.002;
    this.latitude = latitude;
    this.longitude = longitude;

    // this.parent.x = pixelCoordFromGeoCoord(compassObject.nav.currentGeoAnchor.longitude, this.longitude);
    // this.parent.y = -pixelCoordFromGeoCoord(compassObject.nav.currentGeoAnchor.latitude, this.latitude);
    // console.log('item latlong: ' + this.longitude + ', ' + this.latitude + '\nitem coords: ' + this.parent.x + ', ' + this.parent.y);

    // this.updatePosition();
  }

  updateScaleByDistance () {
    let distance = this.state.math.distance(this.compass.x, this.compass.y, this.parent.x, this.parent.y),
        halfSprite = this.compass.width * 0.75;

    if (distance > halfSprite) {
      let targetScale = halfSprite / distance;
      let targetLerp = this.state.math.linear(this.parent.scale.x, targetScale, 0.25);

      // this.parent.scale.setTo(targetLerp, targetLerp);
      this.parent.scale.setTo(targetScale, targetScale);
    } else {
      if (this.parent.scale.x !== 1) {
        this.parent.scale.setTo(1, 1);
      }
    }
    
    // this.parent.shadow.scale.setTo(this.parent.scale.x, this.parent.scale.y);
  }

  fadeIn () {
    // Fade object in.
    let timeAlive = Date.now() - this.generatedTime;
    let timeToFade = window.settings.pickupLife.fadeTime * 1000;
    if (timeAlive <= timeToFade) {
      this.parent.alpha = timeAlive / timeToFade;
    } else if (this.parent.alpha != 1) {
      this.parent.alpha = 1;
    }
  }

  update () {
    this.fadeIn();
  }
}
