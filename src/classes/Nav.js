import '../../node_modules/compass.js/lib/compass.js';

export class Nav {
	constructor (game) {
    this.game = game;

    this.name = 'test';

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

    this.textDisplay = this.game.add.text(0, 0, this.name, {fill: 'white'});

    this.initiateNav();
	}

  get canUseGeolocation () {
    if (navigator.geolocation) {
      this.changeMessage('yes');
      return true;
    }
    this.changeMessage('no');
    return false;
  }

  initiateNav () {
    if (this.canUseGeolocation) {
      this.changeMessage('initiating');
      navigator.geolocation.getCurrentPosition((position) => {
        this.changeMessage(position.coords.latitude + ', ' + position.coords.longitude);
        this.latitude = position.coords.latitude;
        this.longitude = position.coords.longitude;
        this.lastCheck = position.timestamp;
        this.changeMessage(this.latitude + ', ' + this.longitude);

        this.initiateCompass();
      }, (error) => {
        this.changeMessage(error.message);
      }, {timeout: 5000, maximumAge: 0});
    } else {
      this.errorMessage = this.messages.noGeolocation;
      this.showErrorMessage();
    }
  }

  initiateCompass () {
    let self = this;
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
          this.textDisplay.text = this.heading;
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
      this.changeMessage(this.errorMessage);
    }
  }

  changeMessage (newMessage) {
    this.textDisplay.text = newMessage;
  }
}
