import 'pixi.js';
import 'p2';
import 'phaser';

import {Nav} from '../classes/Nav';
import {Item} from '../classes/Item';
import {Character} from '../classes/Character';
import {Inventory} from '../classes/Inventory';
import {Settings} from '../classes/Settings';

export class MainInterface extends Phaser.State {
	constructor() {
    super();

    this.character = new Character();

    this.inventory = new Inventory();

    this.settings = new Settings();

    this.hasGeneratedItems = false;
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
    this.compass = this.add.sprite(Math.round(this.game.width / 2), Math.round(this.game.height / 4), 'compass');
    this.compass.anchor.x = 0.5;
    this.compass.anchor.y = 0.5;
    this.compass.nav = new Nav(this);
    console.log('compass at: ' + this.compass.x + ', ' + this.compass.y);

    // this.generateItems();
  }

  update () {
    // this.updateCompassAngle();
    if (this.hasGeneratedItems) {
      this.thing.item.updatePosition();
    }
  }

  updateCompassAngle () {
    // this.compass.angle = this.compass.nav.heading;
  }

  generateItems () {
    console.log('generating items');
    this.thing = this.add.sprite(this.game.width / 2, this.game.height / 4, 'red-square');
    this.thing.item = new Item(this.thing, this.compass, {});

    this.hasGeneratedItems = true;
  }
}
