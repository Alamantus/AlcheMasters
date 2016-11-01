import 'pixi.js';
import 'p2';
import 'phaser';

import redSquareImagePath from '../images/ui/red-square.png';
import compassImagePath from '../images/ui/compass.png';
import pinImagePath from '../images/ui/pin_neutral.png';
// import paperImagePath from '../images/paper_map.jpg';
import paperImagePath from '../images/grid.png';
import materialImagePath from '../images/map_icons/material.png';

export class ImageLoad extends Phaser.State {
	constructor() {
    super();
	}

  init () {
  }

	preload () {
    this.load.spritesheet('red-square', redSquareImagePath, 32, 32);
    this.load.spritesheet('compass', compassImagePath, 32, 32);
    this.load.spritesheet('pin_neutral', pinImagePath, 32, 32);
    this.load.image('paper', paperImagePath);
    this.load.image('material', materialImagePath);
	}

  create () {
    this.game.state.start('PortraitInterface', true, false);
  }

  update () {
  }
}
