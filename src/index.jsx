import './index.html';
import './sass/main.scss';

import React from 'react';
import ReactDOM from 'react-dom';
import 'idb-wrapper';

import {dynamicSort} from './js/helpers';

import {Item} from './components/Item';

class Game extends React.Component {
	constructor(props) {
		super(props);

    this.state = {
      character: {
        level: 0,
        experience: 0,
        levelUpExperience: 20,
        inventoryMax: 10
      },
      inventory: [],
      settings: {
        sortMethod: ['name']
      }
    }
	}

  get numberOfItems() {
    return this.state.inventory.length;
  }

  addItem(item) {
    if (this.numberOfItems < this.state.character.inventoryMax) {
      let itemId = this.saveItemToDB(item);

      if (itemId.isNaN()) {
        // Item was not added successfully and there's an error message.
      } else {
        // Item added successfully.
        item.id = itemId;
        this.insertItemIntoInventory(item);
      }
    } else {
      // Inventory is full.
    }
  }

  insertItemIntoInventory(item) {
    let updatedInventory = this.state.inventory;
    updatedInventory.push(item);

    updatedInventory.sort(dynamicSort(sortMethod));
    
    this.setState({
      inventory: updatedInventory
    });
  }

	saveItemToDB(item) {
    // Puts item into IndexedDB and returns the ID.

    let resultID;

    let inventoryDB = new IDBStore({
      dbVersion: 1,
      storeName: 'inventory',
      keyPath: 'id',
      autoIncrement: true,
      onStoreReady: function(){
        console.log('Store ready!');
      }
    });

    inventoryDB.put(item, (id) => {
      resultID = id;
      console.log('Item added with ID ' + id);
    }, (error) => {
      resultID = error;
      console.log('Item not added: ', error);
    });

    return resultID;
	}

	render() {
		return (
			<div>

        <Item
          item={{}} />

			</div>
		);
	}
}

ReactDOM.render(<Game />, document.getElementById('game'));