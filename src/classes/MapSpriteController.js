import {getRandom, square} from '../js/helpers';

export class MapSpriteController {
  constructor (parentObject, compassObject) {
    this.parent = parentObject;
    this.parent.anchor.x = 0.5;
    this.parent.anchor.y = 0.5;

    this.compass = compassObject;
    this.lastCompassHeading = -1;
    this.lastCompassLatitude = 0;
    this.lastCompassLongitude = 0;

    const LATLONGMAXDISTANCE = 0.002;
    this.longitude = this.compass.nav.longitude + getRandom(-LATLONGMAXDISTANCE, LATLONGMAXDISTANCE);
    this.latitude = this.compass.nav.latitude + getRandom(-LATLONGMAXDISTANCE, LATLONGMAXDISTANCE);
    console.log('item latlong: ' + this.longitude + ', ' + this.latitude);

    this.angleMarginOfError = 0.05;
    this.geoMarginOfError = 0.00008;

    this.updatePosition();
  }

  get geoIsInsideMarginOfError() {
    return (this.compass.nav.longitude < this.lastCompassLongitude + this.geoMarginOfError
            && this.compass.nav.longitude > this.lastCompassLongitude - this.geoMarginOfError
            && this.compass.nav.latitude < this.lastCompassLatitude + this.geoMarginOfError
            && this.compass.nav.latitude > this.lastCompassLatitude - this.geoMarginOfError);
  }

  get headingIsInsideMarginOfError() {
    return (this.compass.nav.heading < this.lastCompassHeading + this.angleMarginOfError
            && this.compass.nav.heading > this.lastCompassHeading - this.angleMarginOfError);
  }

  calcPosition (pixelScale) {
    console.log('pixelScale = ' + pixelScale);
    const LATLONGTOPIXELADJUSTMENT = 1000;
    console.log('LATLONGTOPIXELADJUSTMENT = ' + LATLONGTOPIXELADJUSTMENT);

    let itemOffset = {
      x: (this.compass.nav.longitude - this.longitude) * LATLONGTOPIXELADJUSTMENT
    , y: (this.compass.nav.latitude - this.latitude) * LATLONGTOPIXELADJUSTMENT
    }
    console.log('itemOffset = ' + itemOffset.x + ', ' + itemOffset.y);

    // radius should be the length of the line from the center to the item.
    let radius = Math.sqrt((itemOffset.x * itemOffset.x) + (itemOffset.y * itemOffset.y));
    console.log('radius = ' + radius);

    this.pixelDistance = radius * pixelScale;

    // Calculate the distance between forward point and item position.
    let distanceBetweenPoints = Math.sqrt(square(0 - (itemOffset.x)) + square(radius - (itemOffset.y)))
    console.log('distanceBetweenPoints = ' + distanceBetweenPoints);

    let doubleRadiusSquared = 2 * square(radius);
    console.log('doubleRadiusSquared = ' + doubleRadiusSquared);

    let insideArcCos = (doubleRadiusSquared - square(distanceBetweenPoints)) / doubleRadiusSquared;
    console.log('insideArcCos = ' + insideArcCos);

    let compassHeadingRadians = this.compass.nav.heading * (Math.PI / 180);

    let angle = Math.acos(insideArcCos) - compassHeadingRadians;
    console.log('angle = ' + angle);

    // Pretty sure the acos of relativeAngle and the cos below cancel out, but we'll see.
    let result = {
      x: Math.round(this.compass.x + (this.pixelDistance * Math.cos(angle)))
    , y: Math.round(this.compass.y + (this.pixelDistance * Math.sin(angle)))
    }
    console.log('item at: ' + result.x + ', ' + result.y);

    return result;
  }

  updatePosition () {
    if (!(this.headingIsInsideMarginOfError && this.geoIsInsideMarginOfError)) {
      this.lastCompassHeading = this.compass.nav.heading;
      let positionOnScreen = this.calcPosition(20);
      this.parent.x = positionOnScreen.x;
      this.parent.y = positionOnScreen.y;
    }
  }
}
