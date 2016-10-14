export class Character {
  constructor () {
    this.level = 0;
    this.experience = 0;
    this.levelUpExperience = 20;
    this.inventoryMax = 10;
  }
}

export let character = new Character();