import './index.html';
import './sass/main.scss';

import 'pixi.js';
import 'p2';
import 'phaser';

import {ImageLoad} from './states/ImageLoad';
import {PortraitInterface} from './states/PortraitInterface';
import {LandscapeInterface} from './states/LandscapeInterface';

import {Settings} from './classes/Settings';

window.settings = new Settings();

// Create a new Phaser instance with same width and height as the window,
// picking webGL or canvas automatically, and putting it into HTML with the id='game'.
const game = new Phaser.Game(window.innerWidth, window.innerHeight, Phaser.AUTO, 'game');

// Create the game states with autostart = false.
game.state.add('ImageLoad', new ImageLoad(), false);
game.state.add('PortraitInterface', new PortraitInterface(), false);
game.state.add('LandscapeInterface', new LandscapeInterface(), false);

// Set the random seed for the interfaces. State.rnd.sow() accepts an array of seeds.
// game.state.states['PortraitInterface'].rnd.sow([window.settings.randomSeed]);
// game.state.states['LandscapeInterface'].rnd.sow([window.settings.randomSeed]);

// Launch the game state, clearWorld = true, clearCache = false, and parameter imgPaths object
game.state.start('ImageLoad', true, false);

/*// Listen for resize changes
window.addEventListener("resize", function() {
  // Get screen size (inner/outerWidth, inner/outerHeight)
  changeScreenOnResize();
}, false);

function changeScreenOnResize () {
  game.width = window.innerWidth;
  game.height = window.innerHeight;

  if (game.height > game.width && game.state.current !== 'PortraitInterface') {
    // Portrait, change to Compass map
    game.state.start('PortraitInterface', true, false);
  }

  if (game.width > game.height && game.state.current !== 'LandscapeInterface') {
    // Portrait, change to Compass map
    game.state.start('LandscapeInterface', true, false);
  }
}*/
