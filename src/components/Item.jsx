import React from 'react';

import {colorToElement, capitalizeString} from '../js/helpers';

export class Item extends React.Component {
	constructor(props) {
		super(props);

    this.name = props.item.name || 'Error Item';
    this.description = props.item.description || 'No item specified.';
    this.type = props.item.type || 'error';
    this.color = props.item.color || 'error'

    // potency, power, etc.
    this.strength = props.item.strength || 0;

    // durability, second duration, etc.
    this.uses = props.item.description || 0;
	}

  displayStats() {
    let showColor = true;
    let colorSpan;
    let colorWording,
        strengthWording;

    if (this.type == 'tool' || this.type == 'weapon') {
      colorWording = 'Element: ' + capitalizeString(colorToElement(this.color));
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
      colorSpan = (
        <span>
          {colorWording}
        </span>
      );
    }

    return (
      <div>

        {colorSpan}

        <span>
          {strengthWording}: {this.strength}
        </span>
      
      </div>
    );
  }

	render() {
		return (
			<div className='item'>
        <span className='type'>
          {capitalizeString(this.type)}
        </span>

        <span className='count'>
          x{this.uses}
        </span>

        <h3 className='name'>
          {this.name}
        </h3>

        <div className='stats'>
          {this.displayStats()}
        </div>

        <p className='description'>
          {this.description}
        </p>
			</div>
		);
	}
}
