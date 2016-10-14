import geolocation from 'geolocation';
import '../../node_modules/compass.js/lib/compass.js';

export class Nav {
	constructor (game) {
    this.game = game;

    this.errorMessage = '';

    this.messages = {
      noGeolocation: 'Your device does not support geolocation! Please try playing again on a device that does.',
      noCompass: 'Your device does not support compass facing! Please try playing again on a device that does.',
      needGPS: 'No GPS Signal found. Go outside and get some signal!',
      needMove: 'Hold your phone ahead of you and start walking.'
    };

    this.latitude = 0;
    this.longitude = 0;
    this.lastCheck = null;
    this.heading = 0;

    this.textDisplay = this.game.add.text(0, 0, this.errorMessage);

    this.initiateNav();
	}

  get canUseGeolocation () {
    if (geolocation) {
      return true;
    }
    return false;
  }

  initiateNav () {
    if (this.canUseGeolocation) {
      geolocation.getCurrentPosition((error, position) => {
        if (error) throw error;

        this.latitude = position.coords.latitude;
        this.longitude = position.coords.longitude;
        this.lastCheck = position.timestamp;

        this.initiateCompass();
      });
    } else {
      this.errorMessage = this.messages.noGeolocation;
      this.showErrorMessage();
    }
  }

  initiateCompass () {
    Compass.needGPS(() => {
      if (this.errorMessage !== this.messages.needGPS) {
        this.errorMessage = this.messages.needGPS;
        this.showErrorMessage();
      }
    }).needMove(() => {
      if (this.errorMessage !== this.messages.needMove) {
        this.errorMessage = this.messages.needMove;
        this.showErrorMessage();
      }
    }).init((method) => {
      if (method !== false) {
        Compass.watch((heading) => {
          this.heading = heading;
        });
      } else {
        this.errorMessage = this.messages.noCompass;
        this.showErrorMessage();
      }
    });
  }

  showErrorMessage () {
    if (this.errorMessage !== '') {
      console.log(this.errorMessage);
      this.textDisplay.text = this.errorMessage;
    }
  }
}
