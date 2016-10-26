import '../../node_modules/compass.js/lib/compass.js';

import {closestMultipleOf, pixelCoordFromGeoCoord} from '../js/helpers';
import {NavSim} from './NavSim';

export class Nav {
	constructor (parent, locationCheckDelaySeconds, runOnReady) {
    this.parent = parent;
    this.state = parent.game.state.getCurrentState();

    this.type = 'prod';

    this.messages = {
      geolocationReady: 'Geolocation active!'
    , noGeolocation: 'Your device does not support geolocation! Please try playing again on a device that does.'
    , noCompass: 'Your device does not support compass facing! Please try playing again on a device that does.'
    , needGPS: 'No GPS Signal found. Go outside and get some signal!'
    , needMove: 'Hold your phone ahead of you and start walking.'
    };

    this.latitude = 0;
    this.longitude = 0;
    this.lastLatitude = null;
    this.lastLongitude = null;
    this.lastCheck = null;
    this.lastUpdate = null;
    this.heading = 0;
    this.lastHeading = null;

    this.currentGeoAnchor = {
      latitude: 0
    , longitude: 0
    , intermediateLatitude: 0
    , intermediateLongitude: 0
    };

    this.geoWatcherIsActive = false;
    this.geoWatcher = null;
    this.compasWatcherIsActive = false;
    this.compasWatcher = null;

    this.targetX = this.parent.x;
    this.targetY = this.parent.y;

    this.locationCheckTimeout = locationCheckDelaySeconds * 1000;

    this.state.navDebugText = 'Inititializing...';

    this.initiateNav(runOnReady);
	}

  get canUseGeolocation () {
    if (navigator.geolocation) {
      this.updateMessage('yes');
      return true;
    }
    this.updateMessage('no');
    return false;
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

  initiateNav (runOnReady) {
    if (this.canUseGeolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        this.lastLongitude = this.longitude = position.coords.longitude;
        this.lastLatitude = this.latitude = position.coords.latitude;
        this.currentGeoAnchor.latitude = closestMultipleOf(window.settings.geoAnchorPlacement, this.latitude);
        this.currentGeoAnchor.longitude = closestMultipleOf(window.settings.geoAnchorPlacement, this.longitude);
        this.currentGeoAnchor.intermediateLatitude = closestMultipleOf(window.settings.halfGeoAnchorPlacement, this.latitude);
        this.currentGeoAnchor.intermediateLongitude = closestMultipleOf(window.settings.halfGeoAnchorPlacement, this.longitude);
        this.lastCheck = position.timestamp;

        this.parent.x = pixelCoordFromGeoCoord(this.currentGeoAnchor.longitude, this.longitude);
        this.parent.y = pixelCoordFromGeoCoord(this.currentGeoAnchor.latitude, this.latitude);

        this.updateMessage(`${this.messages.geolocationReady}\nGeoposition: ${this.latitude}, ${this.longitude}`);

        if (runOnReady){
          runOnReady(this.currentGeoAnchor.latitude, this.currentGeoAnchor.longitude);
        }

        this.startGeoWatcher();

        this.initiateCompass();
      }, (error) => {
        this.updateMessage(error.message);
      }, {enableHighAccuracy: true, timeout: 20000, maximumAge: 0});
    } else {
      this.updateMessage(this.messages.noGeolocation);
    }
  }

  initiateCompass () {
    Compass.needGPS(() => {
      if (this.state.navDebugText !== this.messages.needGPS) {
        this.updateMessage(this.messages.needGPS);
      }
    }).needMove(() => {
      if (this.state.navDebugText !== this.messages.needMove) {
        this.updateMessage(this.messages.needMove);
      }
    }).init((method) => {
      if (method !== false) {
        this.compassWatcher = Compass.watch((heading) => {
          if (!this.compasWatcherIsActive) this.compasWatcherIsActive = true;

          this.lastHeading = this.heading;

          if (!this.headingIsInsideMarginOfError(heading)) {
            this.heading = heading;
            // this.updateMessage(this.heading);
          }
        });
      } else {
        this.updateMessage(this.messages.noCompass);
        this.revertToNavSim();
      }
    });
  }

  startGeoWatcher () {
    this.geoWatcher = navigator.geolocation.watchPosition((position) => {
      if (!this.geoWatcherIsActive) this.geoWatcherIsActive = true;

      this.lastLongitude = this.longitude;
      this.lastLatitude = this.latitude;
      this.lastCheck = position.timestamp;

      if (!this.geoIsInsideMarginOfError(position.coords.latitude, position.coords.longitude)) {
        this.longitude = position.coords.longitude;
        this.latitude = position.coords.latitude;
        this.lastUpdate = position.timestamp;

        this.currentGeoAnchor.latitude = closestMultipleOf(window.settings.geoAnchorPlacement, this.latitude);
        this.currentGeoAnchor.longitude = closestMultipleOf(window.settings.geoAnchorPlacement, this.longitude);
        this.currentGeoAnchor.intermediateLatitude = closestMultipleOf(window.settings.halfGeoAnchorPlacement, this.latitude);
        this.currentGeoAnchor.intermediateLongitude = closestMultipleOf(window.settings.halfGeoAnchorPlacement, this.longitude);

        // Set target value for lerping game world position.
        this.targetX = this.parent.x + (changeLatitude * 100000);
        this.targetY = this.parent.y + (changeLongidude * 100000);
      }

      this.updateMessage(`position: ${this.longitude.toFixed(6)}, ${this.latitude.toFixed(6)}\nchanged: ${(this.lastLongitude - this.longitude).toFixed(6)}, ${(this.lastLatitude - this.latitude).toFixed(6)}`);

    }, (error) => {
      this.updateMessage(error.message);
    }, {enableHighAccuracy: true, timeout: 5000, maximumAge: 0});
  }

  stopNav () {
    if (this.geoWatcherIsActive) {
      navigator.geowatcher.clearWatch(this.geoWatcher);
    }
    if (this.compassWatcherIsActive) {
      Compass.unwatch(this.compassWatcher);
    }
  }

  revertToNavSim () {
    // Replace reference to self with new NavSim, effectively self-destructing.
    this.updateMessage('');
    this.stopNav();
    console.log('Reverting to NavSim');
    this.parent.nav = new NavSim(this.parent, this.latitude, this.longitude);
  }

  geoIsInsideMarginOfError (latitude, longitude) {
    return (longitude < this.lastLongitude + window.settings.geoMarginOfError
            && longitude > this.lastLongitude - window.settings.geoMarginOfError
            && latitude < this.lastLatitude + window.settings.geoMarginOfError
            && latitude > this.lastLatitude - window.settings.geoMarginOfError);
  }

  headingIsInsideMarginOfError (angle) {
    return (angle < this.lastHeading + window.settings.angleMarginOfError
            && angle > this.lastHeading - window.settings.angleMarginOfError);
  }

  updateMessage (newMessage) {
    this.state.navDebugText = newMessage;
    console.log(newMessage);
  }

  update () {
    this.parent.rotation = this.state.math.degToRad(this.heading);
    this.state.worldgroup.rotation = -1 * this.parent.rotation;

    // Get the value within 500 meters (0.005 latlongs)
    this.parent.x = this.state.math.linear(this.parent.x, this.targetX, window.settings.lerpPercent);
    this.parent.y = this.state.math.linear(this.parent.y, this.targetY, window.settings.lerpPercent);

    console.log(this.heading + 'degrees, ' + this.latitude + ', ' + this.longitude + '\nPlayer position: ' + this.parent.x + ', ' + this.parent.y);
  }
}
