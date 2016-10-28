import {MapSpriteController} from './MapSpriteController';

import {millisecondsSinceLastMinute} from '../js/helpers';

export class Pickup extends MapSpriteController {
	constructor(parentObject, compassObject, latitude, longitude) {
    super(parentObject, compassObject, latitude, longitude);

    // Time before destruction in seconds.
		this.life = this.state.rnd.realInRange(window.settings.pickupLife.min, window.settings.pickupLife.max);

    this.deathTime = (Date.now() + this.life * 1000) - millisecondsSinceLastMinute();

    // setTimeout(() => this.parent.destroy(), this.life * 1000);
	}

  update () {
    super.update();
    if (Date.now() > this.deathTime) {
      console.log('destroying!');
      this.parent.destroy();
    }
  }
}
