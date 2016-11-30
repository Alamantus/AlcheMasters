// import '../../node_modules/compass.js/lib/compass.js';

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
    };

    this.latitude = 0;
    this.longitude = 0;
    this.lastLatitude = null;
    this.lastLongitude = null;
    this.lastCheck = null;
    this.lastUpdate = null;

    this.currentGeoAnchor = {
      latitude: 0
    , longitude: 0
    , intermediateLatitude: 0
    , intermediateLongitude: 0
    };

    this.targetX = this.parent.x;
    this.targetY = this.parent.y;

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

        // this.parent.x = this.targetX = pixelCoordFromGeoCoord(this.currentGeoAnchor.longitude, this.longitude);
        // this.parent.y = this.targetY = -pixelCoordFromGeoCoord(this.currentGeoAnchor.latitude, this.latitude);

        this.updateMessage(`Geoposition: ${this.latitude}, ${this.longitude}`);

        if (runOnReady){
          runOnReady(this.currentGeoAnchor.latitude, this.currentGeoAnchor.longitude);
        }

        // this.startGeoWatcher();

        // this.initiateCompass();
      }, (error) => {
        this.updateMessage(error.message);
      }, {enableHighAccuracy: true, timeout: 20000, maximumAge: 0});
    } else {
      this.updateMessage(this.messages.noGeolocation);
    }
  }

  revertToNavSim () {
    // Replace reference to self with new NavSim, effectively self-destructing.
    this.updateMessage('');
    this.stopNavWatchers();
    console.log('Reverting to NavSim');
    this.parent.nav = new NavSim(this.parent, this.latitude, this.longitude);
  }

  geoIsInsideMarginOfError (latitude, longitude) {
    return (longitude < this.lastLongitude + window.settings.geoMarginOfError
            && longitude > this.lastLongitude - window.settings.geoMarginOfError
            && latitude < this.lastLatitude + window.settings.geoMarginOfError
            && latitude > this.lastLatitude - window.settings.geoMarginOfError);
  }

  updateMessage (newMessage) {
    this.state.navDebugText = newMessage;
    console.log(newMessage);
  }

  update () {
  }
}
