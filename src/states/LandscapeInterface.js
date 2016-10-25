import 'pixi.js';
import 'p2';
import 'phaser';

export class LandscapeInterface extends Phaser.State {
	constructor() {
    super();
	}

  init () {
    this.scale.scaleMode = Phaser.ScaleManager.RESIZE;

    // Phaser.Canvas.setImageRenderingCrisp(this.game.canvas);
  }

  preload () {
    this.game.time.advancedTiming = true;
	}

  create () {
  }

  render () {
    this.game.debug.text(this.game.time.fps, 2, 14, "#00ff00");
    this.game.debug.text('Inventory screen', 2, 28, "#ffffff");
  }

  update () {
    
  }

  resize (width, height) {
    if (height > width) {
      // If Portrait, change to Compass/Map
      this.game.state.start('PortraitInterface', true, false);
    }
  }
}
