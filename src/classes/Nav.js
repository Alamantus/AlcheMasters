import '../../node_modules/compass.js/lib/compass.js';

export class Nav {
	constructor (parent, locationCheckDelaySeconds, runOnReady) {
    this.parent = parent;
    this.state = parent.game.state;

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

    this.locationCheckTimeout = locationCheckDelaySeconds * 1000;

    this.debugText = this.state.add.text(2, 28, 'Inititializing...', {font: 'Courier New', fontSize: '14px', fill: '#ff00ff', wordWrap: true, wordWrapWidth: this.state.game.width});

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
      this.getGeolocation(() => {
        this.updateMessage(`${this.messages.geolocationReady}\nGeoposition: ${this.latitude}, ${this.longitude}`);

        runOnReady();

        this.initiateCompass();
      });
    } else {
      this.updateMessage(this.messages.noGeolocation);
    }
  }

  initiateCompass () {
    let self = this;
    Compass.needGPS(() => {
      if (this.debugText.text !== this.messages.needGPS) {
        this.updateMessage(this.messages.needGPS);
      }
    }).needMove(() => {
      if (this.debugText.text !== this.messages.needMove) {
        this.updateMessage(this.messages.needMove);
      }
    }).init((method) => {
      if (method !== false) {
        Compass.watch((heading) => {
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

  getGeolocation (callback) {
    navigator.geolocation.getCurrentPosition((position) => {
      this.lastLongitude = this.longitude;
      this.lastLatitude = this.latitude;
      this.lastCheck = position.timestamp;

      if (!this.geoIsInsideMarginOfError(position.coords.latitude, position.coords.longitude)) {
        this.longitude = position.coords.longitude;
        this.latitude = position.coords.latitude;
        this.lastUpdate = position.timestamp;
      }

      this.updateMessage(`position: ${this.longitude}, ${this.latitude}\nchanged: ${this.lastLongitude - this.longitude}, ${this.lastLatitude - this.latitude}`);

      if (callback){
        callback();
      }

      // Start the geolocation loop.
      setTimeout(() => this.getGeolocation(), this.locationCheckTimeout);
    }, (error) => {
      this.updateMessage(error.message);
      // If it fails, try again.
      setTimeout(() => this.getGeolocation(), this.locationCheckTimeout);
    }, {timeout: 5000, maximumAge: 0});
  }

  revertToNavSim () {
    // Replace reference to self with new NavSim, effectively self-destructing.
    this.parent.nav = new NavSim(this.parent);
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
    this.debugText.text = newMessage;
    console.log(newMessage);
  }
}
