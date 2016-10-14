import 'idb-wrapper';

import {dynamicSort} from '../js/helpers';

export class Inventory {
	constructor() {
    this.items = [];
	}

  get numberOfItems() {
    return this.items.length;
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
    this.items.push(item);

    this.items.sort(dynamicSort(sortMethod));
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

	preload () {
	}

  create () {
  }

  update () {
  }
}

export let inventory = new Inventory();
