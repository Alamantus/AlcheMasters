import 'pixi.js';
import 'p2';
import 'phaser';

import {Nav} from '../classes/Nav';
import {Pickup} from '../classes/Pickup';
import {Character} from '../classes/Character';
import {Inventory} from '../classes/Inventory';

import {radians} from '../js/helpers';

export class PortraitInterface extends Phaser.State {
	constructor() {
    super();

    this.character = new Character();

    this.inventory = new Inventory();

    this.map = {
      pickups: []
    , places: []
    }

    this.hasGeneratedItems = false;
    this.canCheckNav = false;
    this.navCheckDelay = 0;

    this.navDebugText = '';
    this.navDebugText2 = '';

    // Frames before checking the items.
    this.itemCheckFrameDelay = 0;
	}

  init () {
    this.rnd.sow([window.settings.randomSeed]);

    // Phaser.Canvas.setImageRenderingCrisp(this.game.canvas);
  }

	preload () {
    this.scale.scaleMode = Phaser.ScaleManager.RESIZE;
    // this.scale.setResizeCallback(() => this.scale.setMaximum());
	}

  create () {
    console.log(this.game.state.current);

    this.game.time.advancedTiming = true;

    this.game.world.setBounds(-2500, -2500, 5000, 5000);
    this.worldgroup = this.game.add.group();
    // this.backdrop = this.game.add.sprite(0,0,'backdrop');
    // this.worldgroup.add(this.backdrop);
    this.player = this.add.sprite(0, 0, 'compass');
    this.player.anchor.setTo(0.5, 0.5);
    this.player.nav = new Nav(this.player, window.settings.locationCheckDelaySeconds,
      () => {
        this.canCheckNav = true;
        this.generatePickups();
      });
    this.worldgroup.add(this.player);
    this.cursors = this.game.input.keyboard.createCursorKeys();

    
    // console.log('compass at: ' + this.player.x + ', ' + this.player.y);

    // this.northMarker = this.add.text(this.player.x, this.player.y - 40, 'N', {fill: 'yellow', align: 'center'});
    // this.northMarker.anchor.x = 0.5;
    // this.northMarker.anchor.y = 0.5;
  }

  render () {
    this.game.debug.text(this.game.time.fps, 2, 14, "#00ff00");
    this.game.debug.text(this.navDebugText, 2, 28, "#ff00ff");
    this.game.debug.text(this.navDebugText2, 28, 14, "#ff0000");
  }

  update () {
    this.player.nav.update();
    if (this.player.nav.type == 'prod') {
      this.navCheckDelay--;
      if (this.canCheckNav && this.navCheckDelay <= 0) {
        this.canCheckNav = false;
        this.navCheckDelay = window.settings.locationCheckDelaySeconds * this.game.time.fps;
        this.player.nav.getGeolocation(() => this.canCheckNav = true);
      }
    }

    /*this.itemCheckFrameDelay--;
    if (this.hasGeneratedItems) {
      if (this.itemCheckFrameDelay <= 0) {
        this.map.pickups.forEach((pickup) => {
          pickup.pickup.updatePosition();
        });
        // Only check items once every this number of frames.
        this.itemCheckFrameDelay = window.settings.itemCheckDelayNumberOfFrames;
      }
    }*/

    this.worldgroup.pivot.x = this.player.x;
    this.worldgroup.pivot.y = this.player.y;

    this.worldgroup.x = this.worldgroup.pivot.x;
    this.worldgroup.y = this.worldgroup.pivot.y;

    // this.game.camera.focusOnXY(this.player.x, this.player.y + this.player.height - this.camera.view.halfHeight);
    this.game.camera.focusOnXY(this.player.x, this.player.y);

    // this.drawNorth(40);
  }

  resize (width, height) {
    if (width > height) {
      // If Landscape, change to Item management
      this.game.state.start('LandscapeInterface', true, false);
    }
  }

  drawNorth (pixelsFromCenter) {
    let angle = -radians(this.player.nav.heading + 90);

    this.northMarker.x = Math.round(this.player.x + (pixelsFromCenter * Math.cos(angle)));
    this.northMarker.y = Math.round(this.player.y + (pixelsFromCenter * Math.sin(angle)));
    this.northMarker.bringToTop();
  }

  generatePickups () {
    console.log('generating pickups');
    this.map.pickups.push(this.add.sprite(this.player.x + 180, this.player.y + 180, 'red-square'));
    this.map.pickups.push(this.add.sprite(this.player.x + 180, this.player.y - 180, 'red-square'));
    this.map.pickups.push(this.add.sprite(this.player.x - 180, this.player.y + 180, 'red-square'));
    this.map.pickups.push(this.add.sprite(this.player.x - 180, this.player.y - 180, 'red-square'));
    this.map.pickups.push(this.add.sprite(this.player.x + 180, this.player.y, 'red-square'));
    this.map.pickups.push(this.add.sprite(this.player.x - 180, this.player.y, 'red-square'));
    this.map.pickups.push(this.add.sprite(this.player.x, this.player.y + 180, 'red-square'));
    this.map.pickups.push(this.add.sprite(this.player.x, this.player.y - 180, 'red-square'));

    this.map.pickups.forEach((pickup) => {
      pickup.anchor.setTo(0.5, 0.5);
      // pickup.pickup = new Pickup(pickup, this.player, 60, 180);
      // console.log(pickup.pickup.life);

      this.worldgroup.add(pickup);
    });

    this.hasGeneratedItems = true;
  }
}
