interface Item {
  id: string;
  title: string;
  status: boolean;
}

interface ItemUpdates {
  title?: string;
  status?: boolean;
}

class List {
  body = document.createElement('body');
  items: Item[] = [];

  constructor (items: Item[]) {
    this.items = items;
  }

  itemsWereUpdated () {
    console.log(this.items.map(({status}) => status));
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
      console.log(`changed ${item.id}`)
      this.updateItem(item, { status: !item.status });
      this.itemsWereUpdated();
    })

    return input;
  };

  renderCheckbox (item: Item): HTMLDivElement {
    const checkbox = document.createElement('div');

    const input = this.renderInput(item);
    checkbox.appendChild(input);

    const label = document.createElement('label');
    label.setAttribute('for', item.id);
    const text = document.createTextNode(item.title);
    label.appendChild(text);
    const br = document.createElement('br');
    checkbox.appendChild(label);

    checkbox.appendChild(br);

    return checkbox;
  };

  renderList () {
    this.body.innerHTML = '';

    this.items.forEach(item => {
      const checkbox = this.renderCheckbox(item);
      this.body.appendChild(checkbox);
    });
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
    this.body = document.querySelector('body')! as HTMLBodyElement;

    this.renderList();
  }
}


const list = new List([
  {
    id: 'foo',
    title: 'Foo',
    status: true,
  },
  {
    id: 'bar',
    title: 'Bar',
    status: false,
  },
  {
    id: 'baz',
    title: 'Baz',
    status: false,
  },
]);

list.initialize();