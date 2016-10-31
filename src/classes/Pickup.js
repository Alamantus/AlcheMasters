import {MapSpriteController} from './MapSpriteController';

import {millisecondsSinceLastMinute} from '../js/helpers';

export class Pickup extends MapSpriteController {
	constructor(parentObject, compassObject, life, latitude, longitude, generatedTime) {
    super(parentObject, compassObject, latitude, longitude, generatedTime);

    this.canInteract = true;

    // Time before destruction in seconds.
		this.life = life;

    // this.deathTime = (this.generatedTime + (this.life * 1000)) - millisecondsSinceLastMinute();
    this.deathTime = this.generatedTime + (this.life * 1000);

    // setTimeout(() => this.parent.destroy(), this.life * 1000);
	}

  update () {
    super.update();

    // Fade pickup out if less than settings.fadeTime time is left.
    let timeLeft = this.deathTime - Date.now();
    if (timeLeft <= (window.settings.pickupLife.fadeTime * 1000)) {
      // Prevent interaction as it fades away.
      this.canInteract = false;

      this.parent.alpha = timeLeft / (window.settings.pickupLife.fadeTime * 1000);
    }

    if (Date.now() > this.deathTime) {
      console.log('destroying!');
      this.parent.destroy();
    }
  }
}
