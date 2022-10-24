const DEBUG_MODE = false;

interface Item {
  id: string;
  title: string;
  status: boolean;
  node?: HTMLDivElement;
}

interface AddedItem {
  title: string;
}

interface ItemUpdates {
  title?: string;
  status?: boolean;
}

interface Movement {
  from: number;
  to: number;
};


const constants = {
  ids: {
    ADD_NEW_ITEM: 'add-new-item',
    ITEMS_LIST: 'items-list',
  },
  // doneCleanUpDelay: 1000,
}

class List {
  body = document.createElement('body');
  addNewItemElement = document.createElement('div');
  list = document.createElement('div');
  items: Item[] = [];

  constructor () {
    const readFromLocalStorageItems = localStorage.getItem('items');
    const items = JSON.parse(readFromLocalStorageItems || "[]");
    this.items = items;
  }

  itemsWereUpdated () {
    this.saveToLocalStorage();

    if (DEBUG_MODE) {
      console.log('---------------------------------')
      this.items.forEach(item => console.log(item));
    }
  }

  saveToLocalStorage () {
    const toSave = this.items
      .map(({ id, title, status, }) => ({ id, title, status }));

    const data = JSON.stringify(toSave);
    localStorage.setItem('items', data);
  }

  renderInput (item: Item): HTMLInputElement {
    const { id, status } = item;
    const input = document.createElement('input');
    input.setAttribute('type', 'checkbox');
    input.setAttribute('id', `checkbox-${id}`);
    input.setAttribute('name', id);
    input.setAttribute('value', status ? 'done' : '');
    if (status) {
      input.setAttribute('checked', '');
    }

    input.addEventListener('change', () => {
      this.updateItem(id, { status: !item.status });
    })

    return input;
  };

  renderLabel (item: Item): HTMLLabelElement {
    const { id, title } = item;
    const label = document.createElement('label');
    label.setAttribute('for', id);
    const text = document.createTextNode(title);
    label.appendChild(text);
    label.addEventListener('click', () => {
      const titleUpdated = window.prompt(`Change title of ${title}?`);

      if (titleUpdated) {
        this.updateItem(id, { title: titleUpdated });
      }
    });

    return label;
  };

  renderItem (item: Item): HTMLDivElement {
    const itemElement = document.createElement('div');
    itemElement.classList.add('list-item');

    const input = this.renderInput(item);
    itemElement.appendChild(input);

    const label = this.renderLabel(item);
    itemElement.appendChild(label);

    const br = document.createElement('br');
    itemElement.appendChild(br);

    if (item.node) {
      item.node.replaceWith(itemElement); // re-render
    }
    item.node = itemElement;

    return itemElement;
  };

  renderAddNewItemElement () {
    this.addNewItemElement.innerHTML = '';

    const button = document.createElement('button');
    button.setAttribute('type', 'button');

    const text = document.createTextNode('+');
    button.appendChild(text);
    button.addEventListener('click', () => {
      const title = window.prompt('New item');

      if (title) {
        this.addItem({ title });
        this.itemsWereUpdated();
      }
    })

    this.addNewItemElement.appendChild(button);
  };

  renderList () {
    this.list = document.querySelector(`div#${constants.ids.ITEMS_LIST}`)!;
    this.list.innerHTML = '';

    this.items.forEach(item => {
      const checkbox = this.renderItem(item);
      this.list.appendChild(checkbox);
    });
  };

  reorderItems (movements: Movement[]) {
    const listItems = this.list.childNodes;
    movements.forEach(({from, to}) => {
      const childToMove = listItems[from];
      const parentNode = childToMove.parentNode;
      if (parentNode) {
        if (to >= listItems.length - 1) {
          parentNode.appendChild(childToMove)
        } else {
          const childToMoveBefore = to > from
            ? listItems[to + 1]
            : listItems[to];
          parentNode.insertBefore(childToMove, childToMoveBefore);
        }
      }
    })
  }

  addItem (item: AddedItem) {
    const SAFE_EXIT_LIMIT = 1_000_000_000;
    let candidateId: string = (Math.random()*SAFE_EXIT_LIMIT).toString();
    let unique = false;
    let safeExit = 0;
    while (!unique && safeExit < SAFE_EXIT_LIMIT) {
      candidateId = (Math.random()*SAFE_EXIT_LIMIT).toString();
      unique = !this.items.find(({ id }) => id === candidateId);
      safeExit++;
    };
    if (!unique) {
      window.alert('Sorry, too many items already, cannot add another one');
    } else {
      this.items.unshift({
        id: candidateId,
        title: item.title,
        status: false,
      });
    }
    this.renderList();
  };

  updateItem (itemId: string, change: ItemUpdates) {
    const theItemIndex = this.items.findIndex(({id}) => id === itemId);
    const theItem = this.items[theItemIndex];
    if (theItemIndex === -1 || !theItem) {
      throw new Error(`Item to update is not found ${itemId}`);
    }

    const updatedStatus = change.status;
    if (updatedStatus !== undefined) {
      theItem.status = updatedStatus;
      const moveToIndex = this.getSortedIndex(theItemIndex);
      this.reorderItems([{ from: theItemIndex, to: moveToIndex}]);
    }

    const updatedTitle = change.title;
    if (updatedTitle !== undefined) {
      theItem.title = updatedTitle;
      this.renderItem(theItem);
    }

    this.itemsWereUpdated();
  }

  getSortedIndex (originalIndex: number): number {
    // response with a boolean that shows if we need to re-render
    // becasue some re-arrangement of items happened
    let needToReRender = false;

    // TODO: move each of the existing items, change their indexes
    //       this will be needed for proper animation later
    const pendingItems: Item[] = [];
    const pendingItemsIndexes: number[] = [];
    const doneItems: Item[] = [];
    const doneItemsIndexes: number[] = [];

    this.items.forEach((item, index) => {
      if (item.status === true) {
        doneItems.push(item);
        doneItemsIndexes.push(index);
      } else {
        pendingItems.push(item);
        pendingItemsIndexes.push(index);
      }
    });

    const updatedList = pendingItems.concat(doneItems);
    const updatedIndexesList = pendingItemsIndexes.concat(doneItemsIndexes);

    for (let i = 0; i < this.items.length; i++) {
      if (i !== updatedIndexesList[i]) {
        needToReRender = true;
        break;
      }
    }
    if (needToReRender) {
      this.items = updatedList;
      const movedTo = updatedIndexesList.indexOf(originalIndex);
      if (movedTo !== -1) {
        return movedTo;
      }
    }

    return originalIndex;
  }

  initialize () {
    this.body = document.querySelector('body') as HTMLBodyElement;

    this.addNewItemElement = document.createElement('div') as HTMLDivElement;
    this.addNewItemElement.setAttribute('id', constants.ids.ADD_NEW_ITEM);
    this.body.append(this.addNewItemElement);

    this.list = document.createElement('div') as HTMLDivElement;
    this.list.setAttribute('id', 'items-list')
    this.body.append(this.list);


    this.renderAddNewItemElement();
    this.renderList();
  }
}


const list = new List();

list.initialize();