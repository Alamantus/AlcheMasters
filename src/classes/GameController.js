import {Character} from './Character';
import {Inventory} from './Inventory';
import {Settings} from './Settings';

class GameController {
  constructor() {
    this.character = new Character();

    this.inventory = new Inventory();

    this.settings = new Settings();
  }
}

export let gameController = new GameController();
