import 'pixi.js';
import 'p2';
import 'phaser';

import redSquareImagePath from '../images/ui/red-square.png';
import compassImagePath from '../images/ui/compass.png';

export class ImageLoad extends Phaser.State {
	constructor() {
    super();
	}

  init () {
  }

	preload () {
    this.load.spritesheet('red-square', redSquareImagePath, 32, 32);
    this.load.spritesheet('compass', compassImagePath, 32, 32);
	}

  create () {
    this.game.state.start('MainInterface', true, false);
  }

  update () {
  }
}
