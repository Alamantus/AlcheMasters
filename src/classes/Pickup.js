import {MapSpriteController} from './MapSpriteController';

import {getRandomInt} from '../js/helpers';

export class Pickup extends MapSpriteController {
	constructor(parentObject, compassObject, latitude, longitude) {
    super(parentObject, compassObject, latitude, longitude);

    // Time before destruction in seconds.
		this.life = getRandomInt(window.settings.pickupLife.min, window.settings.pickupLife.max);

    this.deathTime = Date.now() + this.life * 1000;

    // setTimeout(() => this.parent.destroy(), this.life * 1000);
	}
}
