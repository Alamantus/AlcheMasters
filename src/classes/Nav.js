import '../../node_modules/compass.js/lib/compass.js';

export class Nav {
	constructor (state, locationCheckTimeout, runOnReady) {
    this.state = state;

    this.messages = {
      geolocationReady: 'Geolocation active!'
    , noGeolocation: 'Your device does not support geolocation! Please try playing again on a device that does.'
    , noCompass: 'Your device does not support compass facing! Please try playing again on a device that does.'
    , needGPS: 'No GPS Signal found. Go outside and get some signal!'
    , needMove: 'Hold your phone ahead of you and start walking.'
    };

    this.latitude = 0;
    this.longitude = 0;
    this.lastCheck = null;
    this.heading = 0;

    this.locationCheckTimeout = locationCheckTimeout;

    this.textDisplay = this.state.add.text(0, 0, 'Inititializing...', {fill: 'white', wordWrap: true, wordWrapWidth: this.state.game.width});

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

  initiateNav (runOnReady) {
    if (this.canUseGeolocation) {
      this.getGeolocation(() => {
        this.updateMessage(this.messages.geolocationReady + ' Geoposition: ' + this.latitude + ', ' + this.longitude);

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
      if (this.textDisplay.text !== this.messages.needGPS) {
        this.updateMessage(this.messages.needGPS);
      }
    }).needMove(() => {
      if (this.textDisplay.text !== this.messages.needMove) {
        this.updateMessage(this.messages.needMove);
      }
    }).init((method) => {
      if (method !== false) {
        Compass.watch((heading) => {
          this.heading = heading;
          this.updateMessage(this.heading);
        });
      } else {
        this.updateMessage(this.messages.noCompass);
      }
    });
  }

  getGeolocation (callback) {
    navigator.geolocation.getCurrentPosition((position) => {
      // this.updateMessage(position.coords.latitude + ', ' + position.coords.longitude);
      this.latitude = position.coords.latitude;
      this.longitude = position.coords.longitude;
      this.lastCheck = position.timestamp;
      // console.log('compass latlong: ' + this.longitude + ', ' + this.latitude);

      if (callback){
        callback();
      }

      // Start the geolocation loop.
      setTimeout(() => this.getGeolocation(), this.locationCheckTimeout);
    }, (error) => {
      this.updateMessage(error.message);
    }, {timeout: 5000, maximumAge: 0});
  }

  updateMessage (newMessage) {
    this.textDisplay.text = newMessage;
    console.log(newMessage);
  }
}
