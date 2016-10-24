import 'pixi.js';
import 'p2';
import 'phaser';

import {Nav} from '../classes/Nav';
import {Pickup} from '../classes/Pickup';
import {Character} from '../classes/Character';
import {Inventory} from '../classes/Inventory';

import {radians} from '../js/helpers';

export class LandscapeInterface extends Phaser.State {
	constructor() {
    super();

    this.character = new Character();

    this.inventory = new Inventory();

    this.map = {
      pickups: []
    , places: []
    }

    this.hasGeneratedItems = false;

    // Frames before checking the items.
    this.itemCheckFrameDelay = 0;
	}

  init () {
    this.scale.scaleMode = Phaser.ScaleManager.RESIZE;

    // Phaser.Canvas.setImageRenderingCrisp(this.game.canvas);
  }

	preload () {
	}

  create () {
    console.log(this.game.state.current);

    this.game.time.advancedTiming = true;

    this.compass = this.add.sprite(Math.round(this.game.width / 2), Math.round(this.game.height / 4), 'compass');
    this.compass.anchor.x = 0.5;
    this.compass.anchor.y = 0.5;
    this.compass.nav = new Nav(this.compass, window.settings.locationCheckDelaySeconds, () => this.generatePickups());
    // console.log('compass at: ' + this.compass.x + ', ' + this.compass.y);

    // this.northMarker = this.add.text(this.compass.x, this.compass.y - 40, 'N', {fill: 'yellow', align: 'center'});
    // this.northMarker.anchor.x = 0.5;
    // this.northMarker.anchor.y = 0.5;
  }

  render () {
    this.game.debug.text(this.game.time.fps, 2, 14, "#00ff00");
  }

  update () {
    if (this.compass.nav.type == 'test') {
      this.compass.nav.update();
    }

    this.itemCheckFrameDelay--;
    if (this.hasGeneratedItems) {
      if (this.itemCheckFrameDelay <= 0) {
        this.map.pickups.forEach((pickup) => {
          pickup.pickup.updatePosition();
        });
        // Only check items once every this number of frames.
        this.itemCheckFrameDelay = window.settings.itemCheckDelayNumberOfFrames;
      }
    }

    // this.drawNorth(40);
  }

  resize (width, height) {
    if (height > width) {
      // If Portrait, change to Compass/Map
      this.game.state.start('PortraitInterface', true, false);
    }
  }

  drawNorth (pixelsFromCenter) {
    let angle = -radians(this.compass.nav.heading + 90);

    this.northMarker.x = Math.round(this.compass.x + (pixelsFromCenter * Math.cos(angle)));
    this.northMarker.y = Math.round(this.compass.y + (pixelsFromCenter * Math.sin(angle)));
    this.northMarker.bringToTop();
  }

  generatePickups () {
    console.log('generating pickups');
    this.map.pickups.push(this.add.sprite(this.game.width / 2, this.game.height / 4, 'red-square'));
    this.map.pickups.push(this.add.sprite(this.game.width / 2, this.game.height / 4, 'red-square'));
    this.map.pickups.push(this.add.sprite(this.game.width / 2, this.game.height / 4, 'red-square'));

    this.map.pickups.forEach((pickup) => {
      pickup.pickup = new Pickup(pickup, this.compass, 60, 180);
      // console.log(pickup.pickup.life);
    });

    this.hasGeneratedItems = true;
  }
}
