import {getRandom, square, radians, inverseLerp} from '../js/helpers';

export class MapSpriteController {
  constructor (parentObject, compassObject) {
    this.parent = parentObject;
    this.parent.anchor.x = 0.5;
    this.parent.anchor.y = 0.5;

    this.compass = compassObject;
    this.lastCompassHeading = -1;
    this.lastCompassLatitude = 0;
    this.lastCompassLongitude = 0;

    // I belive this will only be used for testing! LatLong will likely be distributed based on positions
    // at regular 0.005 (or something like that) global latlong intervals that the player is closest to.
    const LATLONGMAXDISTANCE = 0.002;
    this.longitude = this.compass.nav.longitude + getRandom(-LATLONGMAXDISTANCE, LATLONGMAXDISTANCE);
    this.latitude = this.compass.nav.latitude + getRandom(-LATLONGMAXDISTANCE, LATLONGMAXDISTANCE);
    // console.log('item latlong: ' + this.longitude + ', ' + this.latitude);

    this.updatePosition();
  }

  get geoIsInsideMarginOfError() {
    return (this.compass.nav.longitude < this.lastCompassLongitude + window.settings.geoMarginOfError
            && this.compass.nav.longitude > this.lastCompassLongitude - window.settings.geoMarginOfError
            && this.compass.nav.latitude < this.lastCompassLatitude + window.settings.geoMarginOfError
            && this.compass.nav.latitude > this.lastCompassLatitude - window.settings.geoMarginOfError);
  }

  get headingIsInsideMarginOfError() {
    return (this.compass.nav.heading < this.lastCompassHeading + window.settings.angleMarginOfError
            && this.compass.nav.heading > this.lastCompassHeading - window.settings.angleMarginOfError);
  }

  calcPosition (pixelScale) {
    // console.log('pixelScale = ' + pixelScale);
    const LATLONGTOPIXELADJUSTMENT = 1000;
    // console.log('LATLONGTOPIXELADJUSTMENT = ' + LATLONGTOPIXELADJUSTMENT);

    let itemOffset = {
      x: (this.compass.nav.longitude - this.longitude) * LATLONGTOPIXELADJUSTMENT
    , y: (this.compass.nav.latitude - this.latitude) * LATLONGTOPIXELADJUSTMENT
    }
    // console.log('item geoposition offset = ' + (itemOffset.x / LATLONGTOPIXELADJUSTMENT) + ', ' + (itemOffset.y / LATLONGTOPIXELADJUSTMENT));

    // radius should be the length of the line from the center to the item.
    let radius = Math.sqrt((itemOffset.x * itemOffset.x) + (itemOffset.y * itemOffset.y));
    // console.log('radius = ' + radius);

    // Calculate the distance between forward point and item position.
    let distanceBetweenPoints = Math.sqrt(square(0 - (itemOffset.x)) + square(radius - (itemOffset.y)))
    // console.log('distanceBetweenPoints = ' + distanceBetweenPoints);

    let doubleRadiusSquared = 2 * square(radius);
    // console.log('doubleRadiusSquared = ' + doubleRadiusSquared);

    let insideArcCos = (doubleRadiusSquared - square(distanceBetweenPoints)) / doubleRadiusSquared;
    // console.log('insideArcCos = ' + insideArcCos);

    let angle = Math.acos(insideArcCos) - radians(this.compass.nav.heading - 90);
    // console.log('angle = ' + angle);

    // The xAdjustmentvalues equate to the itemOffset and radius values so we can use inverseLerp.
    let minAdjustmentValue = window.settings.minPixelDistance / pixelScale;
    let maxAdjustmentValue = window.settings.maxPixelDistance / pixelScale;

    // This returns a distance scaled by a scaled pixelScale. The closer the object is, the lower the pixelScale, and the farther something is, the larger the pixelScale.
    // This makes the object display farther away when it's farther away but approach quickly as you get closer by reducing the radius scale.
    // The pixelDistance is then controlled by the max and min pixelDistance settings.
    this.pixelDistance = radius * (pixelScale * inverseLerp(minAdjustmentValue, maxAdjustmentValue, radius));
    if (this.pixelDistance > window.settings.maxPixelDistance) {
      this.pixelDistance = window.settings.maxPixelDistance;
    }
    if (this.pixelDistance < window.settings.minPixelDistance) {
      this.pixelDistance = window.settings.minPixelDistance;
    }
    // console.log('pixelDistance = ' + this.pixelDistance);

    let result = {
      x: Math.round(this.compass.x + (this.pixelDistance * Math.cos(angle)))
    , y: Math.round(this.compass.y + (this.pixelDistance * Math.sin(angle)))
    }
    // console.log('item at: ' + result.x + ', ' + result.y);

    return result;
  }

  updatePosition () {
    if (!(this.headingIsInsideMarginOfError && this.geoIsInsideMarginOfError)) {
      this.lastCompassHeading = this.compass.nav.heading;
      let positionOnScreen = this.calcPosition(window.settings.pixelScale);
      this.parent.x = positionOnScreen.x;
      this.parent.y = positionOnScreen.y;
    }
  }
}
