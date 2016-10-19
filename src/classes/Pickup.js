import {MapSpriteController} from './MapSpriteController';

import {getRandomInt} from '../js/helpers';

export class Pickup extends MapSpriteController {
	constructor(parentObject, compassObject, minLife, maxLife) {
    super(parentObject, compassObject);

    // Time before destruction in seconds.
		this.life = getRandomInt(minLife, maxLife);

    this.deathTime = Date.now() + this.life * 1000;

    // setTimeout(() => this.parent.destroy(), this.life * 1000);
	}
}