import {colorElementMap, capitalizeString} from '../js/helpers';

export class Item {
	constructor(itemDetails) {
    this.name = itemDetails.name || 'Error Item';
    this.description = itemDetails.description || 'No item specified.';
    this.type = itemDetails.type || 'error';
    this.color = itemDetails.color || 'error';

    // potency, power, etc.
    this.strength = itemDetails.strength || 0;

    // durability, second duration, etc.
    this.uses = itemDetails.description || 0;
	}

  displayStats() {
    let showColor = true;
    let colorWording,
        strengthWording;

    if (this.type == 'tool' || this.type == 'weapon') {
      colorWording = 'Element: ' + capitalizeString(colorElementMap[this.color]);
    } else {
      colorWording = 'Color: ' + capitalizeString(this.color);
    }

    switch (this.type) {
      case 'ingredient': {
        strengthWording = 'Quality';
        break;
      }
      case 'potion': {
        strengthWord = 'Potency';
        showColor = false;
        break;
      }
      case 'tool': {
        strengthWord = 'Effectiveness';
        break;
      }
      case 'weapon': {
        strengthWord = 'Power';
        break;
      }
    }

    if (showColor) {
      
    }
  }
}
