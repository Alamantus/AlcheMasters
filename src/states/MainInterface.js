import 'pixi.js';
import 'p2';
import 'phaser';

import {Nav} from '../classes/Nav';
import {Pickup} from '../classes/Pickup';
import {Character} from '../classes/Character';
import {Inventory} from '../classes/Inventory';
import {Settings} from '../classes/Settings';

export class MainInterface extends Phaser.State {
	constructor() {
    super();

    this.character = new Character();

    this.inventory = new Inventory();

    this.settings = new Settings();

    this.map = {
      pickups: []
    , places: []
    }

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
    this.compass.nav = new Nav(this, 5000, () => this.generatePickups());
    console.log('compass at: ' + this.compass.x + ', ' + this.compass.y);

    // this.generatePickups();
  }

  update () {
    // this.updateCompassAngle();
    if (this.hasGeneratedItems) {
      this.map.pickups.forEach((pickup) => {
        pickup.pickup.updatePosition();
      });
    }
  }

  updateCompassAngle () {
    // this.compass.angle = this.compass.nav.heading;
  }

  generatePickups () {
    console.log('generating pickups');
    let addedItem = null;
    this.map.pickups.push(this.add.sprite(this.game.width / 2, this.game.height / 4, 'red-square'));
    addedItem = this.map.pickups[this.map.pickups.length - 1];
    addedItem.pickup = new Pickup(this.thing, this.compass, {});

    this.hasGeneratedItems = true;
  }
}
