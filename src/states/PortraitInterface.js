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
    this.nextGenerationTime = Date.now();

    this.isUsingNavSim = false;

    this.lastIntermediateAnchorLatitude = 0;
    this.lastIntermediateAnchorLongitude = 0;

    this.navDebugText = '';
    this.navDebugText2 = '';

    // This object holds arrays corresponding to generated items' lifetimes
    // When regenerating, if the seed is the same, the lifetimes will be checked,
    // and if the item should not appear, it will not regenerate.
    this.itemLife = {
      pickups: []
    }

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
    // this.stage.backgroundColor = 0x4488aa;

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

      this.lastIntermediateAnchorLatitude = this.player.nav.currentGeoAnchor.intermediateLatitude;
      this.lastIntermediateAnchorLongitude = this.player.nav.currentGeoAnchor.intermediateLongitude;

      if (this.worldgroup.children.filter((child) => {return (typeof child.pickup !== 'undefined')}).length === 0) {
        if (!this.hasGeneratedItems) {
          this.retroactiveGeneratePickups();
        }
      }

      console.log('Player At: ' + this.player.x + ', ' + this.player.y);
    } else {
      this.player.nav = new Nav(this.player, window.settings.locationCheckDelaySeconds,
        (anchorLatitude, anchorLongitude) => {

          this.lastIntermediateAnchorLatitude = this.player.nav.currentGeoAnchor.intermediateLatitude;
          this.lastIntermediateAnchorLongitude = this.player.nav.currentGeoAnchor.intermediateLongitude;

          if (!this.hasGeneratedItems) {
            this.retroactiveGeneratePickups();
            // this.generatePickupsGrid();
          }

          console.log('Player At: ' + this.player.x + ', ' + this.player.y);
        });
    }
    this.worldgroup.add(this.player);
    this.cursors = this.game.input.keyboard.createCursorKeys();

    let screenRotationDiameter = this.math.distance(0, 0, this.game.width, this.game.height);
    this.bg = this.add.tileSprite(this.player.x, this.player.y, screenRotationDiameter, screenRotationDiameter, 'paper');
    this.bg.anchor.setTo(0.5, 0.5);
    this.worldgroup.add(this.bg);
    
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
    this.player.bringToTop();
    this.bg.sendToBack();

    this.player.nav.update();
    if (this.player.nav.type == 'prod') {
    }
    
    this.bg.x = this.player.x;
    this.bg.y = this.player.y;
    this.bg.tilePosition.x = -this.player.x / this.bg.tileScale.x;
    this.bg.tilePosition.y = -this.player.y / this.bg.tileScale.y;

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

    if (this.hasGeneratedItems) {
      // console.log('this.nextGenerationTime: ' + this.nextGenerationTime);
      if (this.nextGenerationTime < Date.now()) {
        this.generatePickups(this.nextGenerationTime);
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
      // this.game.state.start('LandscapeInterface', true, false);

      this.game.state.start('LandscapeInterface', false, false);
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

        this.player.nav.targetX += offsetX;
        this.player.nav.targetY += offsetY;
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

  setNewSeedFromGeoAnchor (anchorLatitude, anchorLongitude, timeReference) {
    // Produces a predictable seed based on the current Geo Anchor and minute.
    this.seed = this.generateSeed(anchorLatitude, anchorLongitude, timeReference);
    // console.log(this.seed);
    this.rnd.sow([this.seed]);
  }

  generateSeed (anchorLatitude, anchorLongitude, timeReference) {
    let generationInterval = window.settings.pickupLife.min * 1000;
    return Math.abs(anchorLatitude) + Math.abs(anchorLongitude) + (Math.floor(timeReference / generationInterval) * generationInterval);
  }

  retroactiveGeneratePickups () {
    // Generate previously-generated objects back to the longest-lived object still possibly alive.
    console.log('retroactively generating pickups');

    // New objects are generated each minimum pickup lifetime.
    let generationInterval = window.settings.pickupLife.min * 1000;
    let lastGenerationTime = Math.floor(Date.now() / generationInterval) * generationInterval;
    console.log('last generation time: ' + lastGenerationTime);

    // The object with the longest possible lifetime happened the max lifetime before the last generation time.
    let startGeneratingFromTime = lastGenerationTime - (window.settings.pickupLife.max * 1000 * 2);
    let startGenerationTime = Math.floor(startGeneratingFromTime / generationInterval) * generationInterval;
    console.log('starting generation time: ' + startGenerationTime);

    let retroactiveTime = startGenerationTime;

    // Generate pickups between startGenerationTime and most recent generation time.
    while (retroactiveTime <= lastGenerationTime) {
      console.log(retroactiveTime == lastGenerationTime);
      this.generatePickups(retroactiveTime);
      retroactiveTime += generationInterval;
    }

    this.hasGeneratedItems = true;
  }

  generatePickups (timeReference) {
    // In order for item generation to be consistent, the same number of calls to this.rnd must be made every time.
    // Because of this, there are a lot of extra calculations that do not actually end up being used, all for the sake
    // of consistency. It's a shame, but I think it's necessary!

    console.log('generating pickups for ' + timeReference);

    this.setNewSeedFromGeoAnchor(this.player.nav.currentGeoAnchor.latitude, this.player.nav.currentGeoAnchor.longitude, timeReference);

    let numberOfItems = this.rnd.integerInRange(Math.floor(this.world.width * 0.05), Math.ceil(this.world.width * 0.1));

    let anchorMinX = this.player.nav.currentGeoAnchor.longitude - window.settings.geoAnchorPlacement,
        anchorMaxX = this.player.nav.currentGeoAnchor.longitude + window.settings.geoAnchorPlacement,
        anchorMinY = this.player.nav.currentGeoAnchor.latitude - window.settings.geoAnchorPlacement,
        anchorMaxY = this.player.nav.currentGeoAnchor.latitude + window.settings.geoAnchorPlacement;

    let alreadyGeneratedPositions = [];

    // console.log('existing children: ' + this.worldgroup.children.length);
    // this.worldgroup.children.forEach((child) => {
    //   if (child.pickup) {
    //     alreadyGeneratedPositions.push({
    //       x: child.x
    //     , y: child.y
    //     });
    //   }
    // })

    for (let i = 0; i < numberOfItems; i++) {
      let pickupLife = this.rnd.realInRange(window.settings.pickupLife.min, window.settings.pickupLife.max);
      let timeLeftToLiveIfGenerated = (timeReference + (pickupLife * 1000)) - Date.now();

      let randomLatitude = this.rnd.realInRange(anchorMinY, anchorMaxY),
          randomLongitude = this.rnd.realInRange(anchorMinX, anchorMaxX);

      let generatedPosition = {
        x: pixelCoordFromGeoCoord(this.player.nav.currentGeoAnchor.longitude, randomLongitude)
      , y: -pixelCoordFromGeoCoord(this.player.nav.currentGeoAnchor.latitude, randomLatitude)
      };

      let timesRegenerated = 0;

      // While the generated values are within range of another item, keep regenerating,
      // but only a limited number of times.
      while (timesRegenerated < window.settings.regeneratePositionTries && (alreadyGeneratedPositions.some((position) => {
              return (generatedPosition.x < position.x + window.settings.minimumPickupDistance && generatedPosition.x > position.x - window.settings.minimumPickupDistance
                      && generatedPosition.y < position.y + window.settings.minimumPickupDistance && generatedPosition.y > position.y - window.settings.minimumPickupDistance);
            })))
      {
        randomLatitude = this.rnd.realInRange(anchorMinY, anchorMaxY);
        randomLongitude = this.rnd.realInRange(anchorMinX, anchorMaxX);
        generatedPosition.x = pixelCoordFromGeoCoord(this.player.nav.currentGeoAnchor.longitude, randomLongitude);
        generatedPosition.y = -pixelCoordFromGeoCoord(this.player.nav.currentGeoAnchor.latitude, randomLatitude);

        timesRegenerated++;
      }

      // Push this position to the queue even if the potential object would already be deleted so it all stays consistent.
      alreadyGeneratedPositions.push({
        x: generatedPosition.x
      , y: generatedPosition.y
      });

      // If there's actually time left before it is deleted, create it! If not, skip and save some processing power.
      if (timeLeftToLiveIfGenerated > 0) {
        let pickup = this.add.sprite(generatedPosition.x, generatedPosition.y, 'material');
        // console.log(pickup.x + ', ' + pickup.y);

        pickup.pickup = new Pickup(pickup, this.player, pickupLife, randomLatitude, randomLongitude, timeReference);

        pickup.events.onDestroy.add(() => {
          pickup.pickup = null;
        });

        this.worldgroup.add(pickup);
      }
    }

    console.log(this.worldgroup.children.filter((child) => {return child.pickup}).length + ' items generated');

    // Set it to generate a new items every minimum pickup lifetime.
    this.nextGenerationTime = timeReference + (window.settings.pickupLife.min * 1000);
    console.log('Now: ' + Date.now());
    console.log('next generation time: ' + this.nextGenerationTime);
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
          
          let pickup = this.add.sprite(x, y, 'material');
          pickup.pickup = new Pickup(pickup, this.player, 0, 0);
          pickup.tint = 0x22ac00;
          pickup.anchor.setTo(0.5, 0.9);
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
