import 'pixi.js';
import 'p2';
import 'phaser';

import redSquareImagePath from '../images/ui/red-square.png';
import compassImagePath from '../images/ui/compass.png';
import shadowImagePath from '../images/ui/shadow.png';
import pinImagePath from '../images/ui/pin_neutral.png';
import paperImagePath from '../images/paper_map.jpg';

export class ImageLoad extends Phaser.State {
	constructor() {
    super();
	}

  init () {
  }

	preload () {
    this.load.spritesheet('red-square', redSquareImagePath, 32, 32);
    this.load.spritesheet('compass', compassImagePath, 32, 32);
    this.load.spritesheet('shadow', shadowImagePath, 32, 32);
    this.load.spritesheet('pin_neutral', pinImagePath, 32, 32);
    this.load.image('paper', paperImagePath);
	}

  create () {
    this.game.state.start('PortraitInterface', true, false);
  }

  update () {
  }
}
