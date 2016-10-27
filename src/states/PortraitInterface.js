import 'pixi.js';
import 'p2';
import 'phaser';

import {Nav} from '../classes/Nav';
import {NavSim} from '../classes/NavSim';
import {Pickup} from '../classes/Pickup';
import {Character} from '../classes/Character';
import {Inventory} from '../classes/Inventory';

import {radians, pixelCoordFromGeoCoord} from '../js/helpers';

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
    this.stage.backgroundColor = 0x4488aa;

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

      if (this.worldgroup.children.filter((child) => {return (typeof child.pickup !== 'undefined')}).length === 0) {
        this.generatePickups();
      }

      console.log('Player At: ' + this.player.x + ', ' + this.player.y);
    } else {
      this.player.nav = new Nav(this.player, window.settings.locationCheckDelaySeconds,
        (anchorLatitude, anchorLongitude) => {
          this.setNewSeedFromGeoAnchor(anchorLatitude, anchorLongitude);

          this.lastIntermediateAnchorLatitude = this.player.nav.currentGeoAnchor.intermediateLatitude;
          this.lastIntermediateAnchorLongitude = this.player.nav.currentGeoAnchor.intermediateLongitude;

          // this.generatePickups();
          this.generatePickupsGrid();
          console.log('Player At: ' + this.player.x + ', ' + this.player.y);
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
        this.worldgroup.children.forEach((child) => {
          // If it's a pickup, run the update method.
          if (child.pickup) {
            child.pickup.update();
          }
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
    // console.log('Last Intermediate Latitude: ' + pixelCoordFromGeoCoord(this.player.nav.currentGeoAnchor.latitude, this.lastIntermediateAnchorLatitude)
    //             + '\nCurrent Intermediate Latitude: ' + pixelCoordFromGeoCoord(this.player.nav.currentGeoAnchor.latitude, this.player.nav.currentGeoAnchor.intermediateLatitude)
    //             + '\n\nLast Intermediate Longitude: ' + pixelCoordFromGeoCoord(this.player.nav.currentGeoAnchor.longitude, this.lastIntermediateAnchorLongitude)
    //             + '\nCurrent Intermediate Longitude: ' + pixelCoordFromGeoCoord(this.player.nav.currentGeoAnchor.longitude, this.player.nav.currentGeoAnchor.intermediateLongitude))

    if (this.lastIntermediateAnchorLatitude !== this.player.nav.currentGeoAnchor.intermediateLatitude
        || this.lastIntermediateAnchorLongitude !== this.player.nav.currentGeoAnchor.intermediateLongitude)
    {
      if (!(this.lastIntermediateAnchorLatitude === this.player.nav.currentGeoAnchor.latitude
            && this.lastIntermediateAnchorLongitude === this.player.nav.currentGeoAnchor.longitude))
      {
        let offsetX = 0,
            offsetY = 0;

        if (this.lastIntermediateAnchorLongitude > this.player.nav.currentGeoAnchor.longitude
            && this.lastIntermediateAnchorLatitude === this.player.nav.currentGeoAnchor.latitude)
        {
          // East
          offsetX = -2500;
        } else if (this.lastIntermediateAnchorLongitude > this.player.nav.currentGeoAnchor.longitude
            && this.lastIntermediateAnchorLatitude > this.player.nav.currentGeoAnchor.latitude)
        {
          // NorthEast
          offsetX = -2500;
          offsetY = 2500;
        } else if (this.lastIntermediateAnchorLongitude === this.player.nav.currentGeoAnchor.longitude
            && this.lastIntermediateAnchorLatitude > this.player.nav.currentGeoAnchor.latitude)
        {
          // North
          offsetY = 2500;
        } else if (this.lastIntermediateAnchorLongitude < this.player.nav.currentGeoAnchor.longitude
            && this.lastIntermediateAnchorLatitude > this.player.nav.currentGeoAnchor.latitude)
        {
          // NorthWest
          offsetX = 2500;
          offsetY = 2500;
        } else if (this.lastIntermediateAnchorLongitude < this.player.nav.currentGeoAnchor.longitude
            && this.lastIntermediateAnchorLatitude === this.player.nav.currentGeoAnchor.latitude)
        {
          // West
          offsetX = 2500;
        } else if (this.lastIntermediateAnchorLongitude < this.player.nav.currentGeoAnchor.longitude
            && this.lastIntermediateAnchorLatitude < this.player.nav.currentGeoAnchor.latitude)
        {
          // SouthWest
          offsetX = 2500;
          offsetY = -2500;
        } else if (this.lastIntermediateAnchorLongitude === this.player.nav.currentGeoAnchor.longitude
            && this.lastIntermediateAnchorLatitude < this.player.nav.currentGeoAnchor.latitude)
        {
          // South
          offsetY = -2500;
        } else if (this.lastIntermediateAnchorLongitude === this.player.nav.currentGeoAnchor.longitude
            && this.lastIntermediateAnchorLatitude < this.player.nav.currentGeoAnchor.latitude)
        {
          // SouthEast
          offsetX = -2500;
          offsetY = -2500;
        }

        console.log('Player At Before Move: ' + this.player.x + ', ' + this.player.y);

        this.worldgroup.children.forEach((child) => {
          child.x += offsetX;
          child.y += offsetY;
        })

        console.log('objects moved by ' + offsetX + ', ' + offsetY);
        console.log('Player At After Move: ' + this.player.x + ', ' + this.player.y);
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
    let seed = Math.abs(anchorLatitude) + Math.abs(anchorLongitude) + (Math.floor(Date.now() / 60000) * 60000);
    console.log(seed);
    this.rnd.sow([seed]);
  }

  generatePickups () {
    console.log('generating pickups');

    let numberOfItems = this.rnd.integerInRange(Math.floor(this.world.width * 0.05), Math.ceil(this.world.width * 0.1));
    let halfWorld = this.world.width * 0.5;

    let anchorMinX = this.player.nav.currentGeoAnchor.longitude - window.settings.geoAnchorPlacement,
        anchorMaxX = this.player.nav.currentGeoAnchor.longitude + window.settings.geoAnchorPlacement,
        anchorMinY = this.player.nav.currentGeoAnchor.latitude - window.settings.geoAnchorPlacement,
        anchorMaxY = this.player.nav.currentGeoAnchor.latitude + window.settings.geoAnchorPlacement;

    for (let i = 0; i < numberOfItems; i++) {
      let randomLatitude = this.rnd.realInRange(anchorMinY, anchorMaxY),
          randomLongitude = this.rnd.realInRange(anchorMinX, anchorMaxX);

      let position = {
        x: pixelCoordFromGeoCoord(this.player.nav.currentGeoAnchor.longitude, randomLongitude)
      , y: pixelCoordFromGeoCoord(this.player.nav.currentGeoAnchor.latitude, randomLatitude)
      };

      let timesRegenerated = 0;

      // While the generated values are within range of another item, keep regenerating,
      // but only a limited number of times.
      while (timesRegenerated < window.settings.regeneratePositionTries && (this.worldgroup.children.some((element) => {
              return ((element.pickup)
                      && (position.x < element.x + element.width && position.x > element.x - element.width
                          && position.y < element.y + element.height && position.y > element.y - element.height));
            })))
      {
        randomLatitude = this.rnd.realInRange(anchorMinY, anchorMaxY);
        randomLongitude = this.rnd.realInRange(anchorMinX, anchorMaxX);
        position.x = pixelCoordFromGeoCoord(this.player.nav.currentGeoAnchor.longitude, randomLongitude);
        position.y = pixelCoordFromGeoCoord(this.player.nav.currentGeoAnchor.latitude, randomLatitude);

        timesRegenerated++;
      }

      let pickup = this.add.sprite(position.x, position.y, 'red-square');
      pickup.anchor.setTo(0.5, 1);
      pickup.pickup = new Pickup(pickup, this.player, randomLatitude, randomLongitude);
      pickup.onDestroy = () => pickup.pickup = null;
      // console.log(randomLatitude + ', ' + randomLatitude + '\n' + pickup.x + ', ' + pickup.y);
      this.worldgroup.add(pickup);
    }

    console.log(this.worldgroup.children.filter((child) => {return child.pickup}).length + ' items generated');

    this.hasGeneratedItems = true;
  }

  generatePickupsGrid () {
    console.log('generating pickups in a grid');

    for (let x = -Math.floor(this.world.width * 0.5); x < this.world.width; x += Math.floor(this.world.width / 30)) {
      for (let y = -Math.floor(this.world.width * 0.5); y < this.world.height; y += Math.floor(this.world.width / 30)) {
        if (!(x === 0 && y === 0)) {
          // let shadow = this.add.image(x, y, 'shadow');
          // shadow.anchor.setTo(0.1, 0.5);
          // shadow.tint = 0xaaaaaa;
          // this.worldgroup.add(shadow);
          // console.log(randomLatitude + ', ' + randomLatitude + '\n' + pickup.x + ', ' + pickup.y);
          
          let pickup = this.add.sprite(x, y, 'pin_neutral');
          pickup.tint = 0x74de70;
          pickup.anchor.setTo(0.5, 0.9);
          pickup.pickup = new Pickup(pickup, this.player, 0, 0);
          // pickup.shadow = shadow;
          pickup.events.onDestroy.add(() => {
            // pickup.shadow.destroy();
            pickup.pickup = null;
          });
          this.worldgroup.add(pickup);
        }
      }
    }

    console.log(this.worldgroup.children.filter((child) => {return child.pickup}).length + ' items generated');

    this.hasGeneratedItems = true;
  }
}
