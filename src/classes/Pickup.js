import {MapSpriteController} from './MapSpriteController';

import {getRandomInt} from '../js/helpers';

export class Pickup extends MapSpriteController {
	constructor(parentObject, compassObject, minLife, maxLife) {
    super(parentObject, compassObject);

    // Time before destruction in milliseconds.
		this.life = getRandom(minLife, maxLife);

    setTimeout(() => this.parent.destroy(), this.life);
	}
}
