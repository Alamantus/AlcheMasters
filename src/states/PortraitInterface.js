import 'pixi.js';
import 'p2';
import 'phaser';

import {Nav} from '../classes/Nav';
import {NavSim} from '../classes/NavSim';
import {Pickup} from '../classes/Pickup';
import {Character} from '../classes/Character';
import {Inventory} from '../classes/Inventory';

import {radians} from '../js/helpers';

export class PortraitInterface extends Phaser.State {
	constructor() {
    super();

    this.character = new Character();

    this.inventory = new Inventory();

    this.hasGeneratedItems = false;
    this.isUsingNavSim = false;
    this.navCheckDelay = 0;

    this.lastIntermediateAnchorLatitude = 0;
    this.lastIntermediateAnchorLongitude = 0;

    this.navDebugText = '';
    this.navDebugText2 = '';

    // Frames before checking the items.
    this.itemCheckFrameDelay = 0;
	}

  init () {
    // Phaser.Canvas.setImageRenderingCrisp(this.game.canvas);
  }

  preload () {
    this.scale.scaleMode = Phaser.ScaleManager.RESIZE;

    this.game.time.advancedTiming = true;
  }

  create () {
    this.map = {
      pickups: []
    , places: []
    }

    console.log(this.game.state.current + ', isUsingNavSim: ' + this.isUsingNavSim);

    // World is ~5x5 km, the distance of 1 Geo Anchor
    let geoAnchorWidth = window.settings.geoAnchorPlacement * window.settings.geoToPixelScale;

    this.world.setBounds(-(geoAnchorWidth * 0.5), -(geoAnchorWidth * 0.5), geoAnchorWidth, geoAnchorWidth);
    this.worldgroup = this.game.add.group();
    // this.backdrop = this.game.add.sprite(0,0,'backdrop');
    // this.worldgroup.add(this.backdrop);
    this.player = this.add.sprite(0, 0, 'compass');
    this.player.anchor.setTo(0.5, 0.5);
    if (this.isUsingNavSim) {
      this.player.nav = new NavSim(this.player, 0, 0);

      this.setNewSeedFromGeoAnchor(this.player.nav.currentGeoAnchor.latitude, this.player.nav.currentGeoAnchor.longitude);

      this.lastIntermediateAnchorLatitude = this.player.nav.currentGeoAnchor.intermediateLatitude;
      this.lastIntermediateAnchorLongitude = this.player.nav.currentGeoAnchor.intermediateLongitude;

      if (this.map.pickups.length === 0) {
        this.generatePickups();
      }
    } else {
      this.player.nav = new Nav(this.player, window.settings.locationCheckDelaySeconds,
        (anchorLatitude, anchorLongitude) => {
          this.setNewSeedFromGeoAnchor(anchorLatitude, anchorLongitude);

          this.lastIntermediateAnchorLatitude = this.player.nav.currentGeoAnchor.intermediateLatitude;
          this.lastIntermediateAnchorLongitude = this.player.nav.currentGeoAnchor.intermediateLongitude;

          this.generatePickups();
        });
    }
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
    }

    this.itemCheckFrameDelay--;
    if (this.hasGeneratedItems) {
      if (this.itemCheckFrameDelay <= 0) {
        this.map.pickups.forEach((pickup) => {
          pickup.pickup.updateScaleByDistance();
        });
        // Only check items once every this number of frames.
        this.itemCheckFrameDelay = window.settings.itemCheckDelayNumberOfFrames;
      }
    }

    this.worldgroup.pivot.x = this.player.x;
    this.worldgroup.pivot.y = this.player.y;

    this.worldgroup.x = this.worldgroup.pivot.x;
    this.worldgroup.y = this.worldgroup.pivot.y;

    // this.game.camera.focusOnXY(this.player.x, this.player.y + this.player.height - this.camera.view.halfHeight);
    this.game.camera.focusOnXY(this.player.x, this.player.y);

    this.moveWorldgroupIfPast();
  }

  resize (width, height) {
    if (width > height) {
      // If Landscape, change to Item management
      this.game.state.start('LandscapeInterface', true, false);
    }
  }

  shutdown () {
    this.map = {
      pickups: []
    , places: []
    }
  }

  moveWorldgroupIfPast () {
    if (this.lastIntermediateAnchorLatitude !== this.player.nav.currentGeoAnchor.intermediateLatitude
        || this.lastIntermediateAnchorLongitude !== this.player.nav.currentGeoAnchor.intermediateLongitude)
    {
      if (!(this.lastIntermediateAnchorLatitude === this.player.nav.currentGeoAnchor.latitude
            && this.lastIntermediateAnchorLongitude === this.player.nav.currentGeoAnchor.longitude))
      {
        let offsetX = 0,
            offsetY = 0;

        if (this.lastIntermediateAnchorLatitude > this.player.nav.currentGeoAnchor.latitude
            && this.lastIntermediateAnchorLongitude === this.player.nav.currentGeoAnchor.longitude)
        {
          // East
          offsetX = 2500;
        } else if (this.lastIntermediateAnchorLatitude > this.player.nav.currentGeoAnchor.latitude
            && this.lastIntermediateAnchorLongitude > this.player.nav.currentGeoAnchor.longitude)
        {
          // NorthEast
          offsetX = 2500;
          offsetY = 2500;
        } else if (this.lastIntermediateAnchorLatitude === this.player.nav.currentGeoAnchor.latitude
            && this.lastIntermediateAnchorLongitude > this.player.nav.currentGeoAnchor.longitude)
        {
          // North
          offsetY = 2500;
        } else if (this.lastIntermediateAnchorLatitude < this.player.nav.currentGeoAnchor.latitude
            && this.lastIntermediateAnchorLongitude > this.player.nav.currentGeoAnchor.longitude)
        {
          // NorthWest
          offsetX = -2500;
          offsetY = 2500;
        } else if (this.lastIntermediateAnchorLatitude < this.player.nav.currentGeoAnchor.latitude
            && this.lastIntermediateAnchorLongitude === this.player.nav.currentGeoAnchor.longitude)
        {
          // West
          offsetX = -2500;
        } else if (this.lastIntermediateAnchorLatitude < this.player.nav.currentGeoAnchor.latitude
            && this.lastIntermediateAnchorLongitude < this.player.nav.currentGeoAnchor.longitude)
        {
          // SouthWest
          offsetX = -2500;
          offsetY = -2500;
        } else if (this.lastIntermediateAnchorLatitude === this.player.nav.currentGeoAnchor.latitude
            && this.lastIntermediateAnchorLongitude < this.player.nav.currentGeoAnchor.longitude)
        {
          // South
          offsetY = -2500;
        } else if (this.lastIntermediateAnchorLatitude === this.player.nav.currentGeoAnchor.latitude
            && this.lastIntermediateAnchorLongitude < this.player.nav.currentGeoAnchor.longitude)
        {
          // SouthEast
          offsetX = 2500;
          offsetY = -2500;
        }

        this.worldgroup.children.forEach((child) => {
          child.x += offsetX;
          child.y += offsetY;
        })

        console.log('objects moved by ' + offsetX + ', ' + offsetY);
      }

      this.lastIntermediateAnchorLatitude = this.player.nav.currentGeoAnchor.intermediateLatitude;
      this.lastIntermediateAnchorLongitude = this.player.nav.currentGeoAnchor.intermediateLongitude;
    }
  }

  drawNorth (pixelsFromCenter) {
    let angle = -radians(this.player.nav.heading + 90);

    this.northMarker.x = Math.round(this.player.x + (pixelsFromCenter * Math.cos(angle)));
    this.northMarker.y = Math.round(this.player.y + (pixelsFromCenter * Math.sin(angle)));
    this.northMarker.bringToTop();
  }

  setNewSeedFromGeoAnchor (anchorLatitude, anchorLongitude) {
    // Produces a predictable seed based on the current Geo Anchor and minute.
    return Math.abs(anchorLatitude) + Math.abs(anchorLongitude) + (Math.floor(Date.now() / 60000) * 60000);
  }

  generatePickups () {
    console.log('generating pickups');

    // for (let x = -Math.floor(this.world.width * 0.5); x < this.world.width; x += Math.floor(this.world.width / 50)) {
    //   for (let y = -Math.floor(this.world.width * 0.5); y < this.world.height; y += Math.floor(this.world.width / 50)) {
    //     if (!(x === 0 && y === 0)) {
    //       this.map.pickups.push(this.add.sprite(x, y, 'red-square'));
    //     }
    //   }
    // }

    let numberOfItems = this.rnd.integerInRange(Math.floor(this.world.width * 0.01), Math.ceil(this.world.width * 0.1));
    let halfWorld = this.world.width * 0.5;

    for (let i = 0; i < numberOfItems; i++) {
      let position = {
        x: this.rnd.integerInRange(-halfWorld, halfWorld)
      , y: this.rnd.integerInRange(-halfWorld, halfWorld)
      };

      let timesRegenerated = 0;

      // While the generated values are within range of another item, keep regenerating,
      // but only a limited number of times.
      while (timesRegenerated < window.settings.regeneratePositionTries && (this.map.pickups.some((element) => {
              return (position.x < element.x + element.width && position.x > element.x - element.width
                      && position.y < element.y + element.height && position.y > element.y - element.height);
            })))
      {
        position.x = this.rnd.integerInRange(-halfWorld, halfWorld);
        position.y = this.rnd.integerInRange(-halfWorld, halfWorld);

        timesRegenerated++;
      }

      this.map.pickups.push(this.add.sprite(position.x, position.y, 'red-square'));
      // this.map.pickups[i].anchor.setTo(0.5, 0.5);
      // this.map.pickups[i].pickup = new Pickup(pickup, this.player, 60, 180);

      // this.worldgroup.add(this.map.pickups[i]);
    }

    this.map.pickups.forEach((pickup) => {
      pickup.anchor.setTo(0.5, 1);
      pickup.pickup = new Pickup(pickup, this.player, 60, 180);
      // console.log(pickup.pickup.life);

      this.worldgroup.add(pickup);
    });

    console.log(this.map.pickups.length + ' items generated');

    this.hasGeneratedItems = true;
  }
}
