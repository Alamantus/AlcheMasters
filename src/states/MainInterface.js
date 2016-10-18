import 'pixi.js';
import 'p2';
import 'phaser';

import {Nav} from '../classes/Nav';
import {Character} from '../classes/Character';
import {Inventory} from '../classes/Inventory';
import {Settings} from '../classes/Settings';

export class MainInterface extends Phaser.State {
	constructor() {
    super();

    this.character = new Character();

    this.inventory = new Inventory();

    this.settings = new Settings();
	}

  init () {
    // this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    // this.scale.pageAlignHorizontally = true;
    // this.scale.pageAlignVertically = true;

    // Phaser.Canvas.setImageRenderingCrisp(this.game.canvas);
  }

	preload () {
	}

  create () {
    this.compass = this.add.sprite(this.game.width / 2, this.game.height / 4, 'compass');
    this.compass.anchor.x = 0.5;
    this.compass.anchor.y = 0.5;
    this.compass.nav = new Nav(this.game);
  }

  update () {
    this.updateCompassAngle();
  }

  updateCompassAngle () {
    this.compass.angle = this.compass.nav.heading;
    // this.compass.nav.textDisplay.text = this.compass.nav.heading;
  }
}
