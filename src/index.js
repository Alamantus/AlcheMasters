import './index.html';
import './sass/main.scss';

import 'pixi.js';
import 'p2';
import 'phaser';

import {ImageLoad} from './states/ImageLoad';
import {MainInterface} from './states/MainInterface';

import {Settings} from './classes/Settings';

window.settings = new Settings();

// Create a new Phaser instance with same width and height as the window,
// picking webGL or canvas automatically, and putting it into HTML with the id='game'.
const game = new Phaser.Game(window.innerWidth, window.innerHeight, Phaser.AUTO, 'game');

// Create the 'MainInterface' game state with autostart = false.
game.state.add('ImageLoad', new ImageLoad(), false);
game.state.add('MainInterface', new MainInterface(), false);

// Launch the game state, clearWorld = true, clearCache = false, and parameter imgPaths object
game.state.start('ImageLoad', true, false);
