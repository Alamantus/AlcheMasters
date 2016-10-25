import {lerp} from '../js/helpers';

export class NavSim {
	constructor (parent, latitude, longitude) {
    this.parent = parent;
    this.state = parent.game.state.getCurrentState();
    this.state.isUsingNavSim = true;

    this.type = 'test';

    this.messages = {
      geolocationReady: 'Geolocation active!'
    , noGeolocation: 'Your device does not support geolocation! Please try playing again on a device that does.'
    , noCompass: 'Your device does not support compass facing! Please try playing again on a device that does.'
    , needGPS: 'No GPS Signal found. Go outside and get some signal!'
    , needMove: 'Hold your phone ahead of you and start walking.'
    };

    // Each 0.00001 latlong difference is ~1 meter.
    this.latitude = latitude;
    this.longitude = longitude;
    this.lastLatitude = null;
    this.lastLongitude = null;
    this.heading = 0;
    this.lastHeading = null;

    this.turnSpeed = 2;
    this.latLongSpeed = 0.000005;

    this.state.navDebugText2 = 'Geolocation Not Supported: For Testing Only';
    this.state.navDebugText = 'Use Arrow Keys to Move Geoposition';
	}

  get positionHasChanged () {
    return this.longitude !== this.lastLongitude || this.latitude === this.lastLatitude;
  }

  get headingHasChanged () {
    return this.heading !== this.lastHeading;
  }

  get hasChanged () {
    return this.headingHasChanged || this.positionHasChanged;
  }

  update () {
    this.lastHeading = this.heading;
    this.lastLongitude = this.longitude;
    this.lastLatitude = this.latitude;

    let heading = this.heading,
        coords = {latitude: this.latitude, longitude: this.longitude};
    
    if (this.state.input.keyboard.isDown(Phaser.Keyboard.LEFT)) {
      heading -= this.turnSpeed;
    } else if (this.state.input.keyboard.isDown(Phaser.Keyboard.RIGHT)) {
      heading += this.turnSpeed;
    }

    if (heading < 0) heading += 360;
    if (heading >= 360) heading -= 360;

    this.heading = heading;

    this.parent.rotation = this.state.math.degToRad(this.heading);
    this.state.worldgroup.rotation = -1 * this.state.math.degToRad(this.heading);

    if (this.state.input.keyboard.isDown(Phaser.Keyboard.UP)) {
      coords.latitude -= this.latLongSpeed * Math.cos(this.parent.rotation);
      coords.longitude += this.latLongSpeed * Math.sin(this.parent.rotation);
    } else if (this.state.input.keyboard.isDown(Phaser.Keyboard.DOWN)) {
      coords.latitude += this.latLongSpeed * Math.cos(this.parent.rotation);
      coords.longitude -= this.latLongSpeed * Math.sin(this.parent.rotation);
    }

    this.latitude = coords.latitude;
    this.longitude = coords.longitude;

    let targetX = this.parent.x + ((this.longitude - this.lastLongitude) * 100000);
    let targetY = this.parent.y + ((this.latitude - this.lastLatitude) * 100000);

    // 1000000 gives latlong change within 1/10 of a meter.
    this.parent.x = targetX;
    this.parent.y = targetY;

    console.log(this.heading + 'degrees, ' + targetX + ', ' + targetY + '\nPlayer position: ' + this.parent.x + ', ' + this.parent.y);
  }
}
