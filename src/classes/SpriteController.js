import {getRandom, square} from '../js/helpers';

export class SpriteController {
  constructor (parentObject, compassObject) {
    this.parent = parentObject;
    this.parent.anchor.x = 0.5;
    this.parent.anchor.y = 0.5;

    this.compass = compassObject;

    const LATLONGMAXDISTANCE = 0.002;
    this.longitude = this.compass.nav.longitude + getRandom(-LATLONGMAXDISTANCE, LATLONGMAXDISTANCE);
    this.latitude = this.compass.nav.latitude + getRandom(-LATLONGMAXDISTANCE, LATLONGMAXDISTANCE);
    console.log('item latlong: ' + this.longitude + ', ' + this.latitude);

    this.updatePosition();
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
    let radius = Math.sqrt((itemOffset.x * itemOffset.x) + (itemOffset.y * itemOffset.y)) * pixelScale;
    console.log('radius = ' + radius);

    // Calculate the distance between forward point and item position.
    let distanceBetweenPoints = Math.sqrt(square(0 - (itemOffset.x * pixelScale)) + square(radius - (itemOffset.y * pixelScale)))
    console.log('distanceBetweenPoints = ' + distanceBetweenPoints);

    let doubleRadiusSquared = 2 * square(radius);
    console.log('doubleRadiusSquared = ' + doubleRadiusSquared);

    let insideArcCos = (doubleRadiusSquared - square(distanceBetweenPoints)) / doubleRadiusSquared;
    console.log('insideArcCos = ' + insideArcCos);

    let compassHeadingRadians = this.compass.nav.heading * (Math.PI / 180);

    let angle = compassHeadingRadians - Math.acos(insideArcCos);
    console.log('angle = ' + angle);

    let cosOfAngle = Math.cos(angle);
    console.log('cosOfAngle = ' + cosOfAngle);

    // Pretty sure the acos of relativeAngle and the cos below cancel out, but we'll see.
    let result = {
      x: Math.round(this.compass.x + (radius * cosOfAngle))
    , y: Math.round(this.compass.y + (radius * cosOfAngle))
    }
    console.log('item at: ' + result.x + ', ' + result.y);

    return result;
  }

  updatePosition () {
    let positionOnScreen = this.calcPosition(5);
    this.parent.x = positionOnScreen.x;
    this.parent.y = positionOnScreen.y;
  }
}
