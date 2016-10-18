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

    this.item = this.add.sprite(this.game.width / 2, this.game.height / 4, 'red-square');
    this.item.anchor.x = 0.5;
    this.item.anchor.y = 0.5;
    this.item.latitude = this.compass.nav.latitude + 0.01;
    this.item.longitude = this.compass.nav.longitude + 0.008;
    let forwardVector = {x: 0, y: 1};
    let forwardVectorNormalized = 1;
    let itemVector = {
      x: Math.abs(this.compass.nav.latitude - this.item.latitude),
      y: Math.abs(this.compass.nav.longitude - this.item.longitude)
    }
    let itemVectorNormalized = Math.sqrt((itemVector.x * itemVector.x) + (itemVector.y * itemVector.y));
    let dotProduct = (forwardVector.x * itemVector.x) + (forwardVector.y + itemVector.y);
    let relativeAngle = Math.acos((dotProduct / (forwardVectorNormalized * itemVectorNormalized)));
    // Pretty sure the acos of relativeAngle and the cos below cancel out, but we'll see.
    // Also, itemVectorNormalized should be the length of the line from the center to the item, which would be radius.
    this.item.x = this.compass.x + (itemVectorNormalized * Math.cos(relativeAngle));
    this.item.y = this.compass.y + (itemVectorNormalized * Math.cos(relativeAngle));
  }

  update () {
    this.updateCompassAngle();
  }

  updateCompassAngle () {
    this.compass.angle = this.compass.nav.heading;
    // this.compass.nav.textDisplay.text = this.compass.nav.heading;
  }
}
