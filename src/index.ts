const DEBUG_MODE = true;

interface Item {
  id: string;
  title: string;
  status: boolean;
}

interface AddedItem {
  title: string;
}

interface ItemUpdates {
  title?: string;
  status?: boolean;
}

const IDs = {
  ADD_NEW_ITEM: 'add-new-item',
  ITEMS_LIST: 'items-list',
};

class List {
  body = document.createElement('body');
  addNewItemElement = document.createElement('div');
  list = document.createElement('div');
  items: Item[] = [];

  constructor (items: Item[]) {
    this.items = items;
  }

  itemsWereUpdated (reRender?: boolean) {
    this.saveToLocalStorage();

    if (DEBUG_MODE) {
      console.log('---------------------------------')
      this.items.forEach(item => console.log(item));
    }

    if (reRender) {
      this.renderList();
    }
  }

  saveToLocalStorage () {
    const data = JSON.stringify(this.items);
    localStorage.setItem('items', data);
  }

  renderInput (item: Item): HTMLInputElement {
    const input = document.createElement('input');
    input.setAttribute('type', 'checkbox');
    input.setAttribute('id', `checkbox-${item.id}`);
    input.setAttribute('name', item.id);
    input.setAttribute('value', item.status ? 'done' : '');
    if (item.status) {
      input.setAttribute('checked', '');
    }

    input.addEventListener('change', () => {
      this.updateItem(item, { status: !item.status });
      this.itemsWereUpdated();
    })

    return input;
  };

  renderLabel (item: Item): HTMLLabelElement {
    const label = document.createElement('label');
    label.setAttribute('for', item.id);
    const text = document.createTextNode(item.title);
    label.appendChild(text);
    label.addEventListener('click', () => {
      const title = window.prompt(`Change title of ${item.title}?`);

      if (title) {
        this.updateItem(item, { title });
        this.itemsWereUpdated(true);
      }
    });

    return label;
  };

  renderItem (item: Item): HTMLDivElement {
    const checkbox = document.createElement('div');

    const input = this.renderInput(item);
    checkbox.appendChild(input);

    const label = this.renderLabel(item);
    checkbox.appendChild(label);

    const br = document.createElement('br');
    checkbox.appendChild(br);

    return checkbox;
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
        this.itemsWereUpdated(true);
      }
    })

    this.addNewItemElement.appendChild(button);
  };

  renderList () {
    this.list = document.querySelector(`div#${IDs.ITEMS_LIST}`)!;
    this.list.innerHTML = '';

    this.items.forEach(item => {
      const checkbox = this.renderItem(item);
      this.list.appendChild(checkbox);
    });
  };

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
  };

  updateItem (item: Item, change: ItemUpdates) {
    const theItem = this.items.find(({id}) => id === item.id);
    if (!theItem) {
      throw new Error(`Item to update is not found ${item.id}`);
    }

    const updatedStatus = change.status;
    if (updatedStatus !== undefined) {
      theItem.status = updatedStatus;
    }
    const updatedTitle = change.title;
    if (updatedTitle !== undefined) {
      theItem.title = updatedTitle;
    }
  }

  initialize () {
    this.body = document.querySelector('body') as HTMLBodyElement;

    this.addNewItemElement = document.createElement('div') as HTMLDivElement;
    this.addNewItemElement.setAttribute('id', IDs.ADD_NEW_ITEM);
    this.body.append(this.addNewItemElement);

    this.list = document.createElement('div') as HTMLDivElement;
    this.list.setAttribute('id', 'items-list')
    this.body.append(this.list);


    this.renderAddNewItemElement();
    this.renderList();
  }
}


const readFromLocalStorageItems = localStorage.getItem('items');
const items = JSON.parse(readFromLocalStorageItems || "[]");
const list = new List(items);

list.initialize();