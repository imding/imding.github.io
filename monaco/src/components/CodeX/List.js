/**
 * @typedef {object} ListData
 * @property {string} style - can be ordered or unordered
 * @property {array} items - li elements
 */

import { inputHandler, deleteHandler } from './keyboardHandler';

/**
 * List Tool for the Editor.js 2.0
 */
export default class List {
  /**
   * Allow to use native Enter behaviour
   * @returns {boolean}
   * @public
   */
  static get enableLineBreaks() {
    return true;
  }

  /**
   * Get Tool toolbox settings
   * icon - Tool icon's SVG
   * title - title to show in toolbox
   *
   * @return {{icon: string, title: string}}
   */
  static get toolbox() {
    return {
      icon: '<svg width="17" height="13" viewBox="0 0 17 13" xmlns="http://www.w3.org/2000/svg"> <path d="M5.625 4.85h9.25a1.125 1.125 0 0 1 0 2.25h-9.25a1.125 1.125 0 0 1 0-2.25zm0-4.85h9.25a1.125 1.125 0 0 1 0 2.25h-9.25a1.125 1.125 0 0 1 0-2.25zm0 9.85h9.25a1.125 1.125 0 0 1 0 2.25h-9.25a1.125 1.125 0 0 1 0-2.25zm-4.5-5a1.125 1.125 0 1 1 0 2.25 1.125 1.125 0 0 1 0-2.25zm0-4.85a1.125 1.125 0 1 1 0 2.25 1.125 1.125 0 0 1 0-2.25zm0 9.85a1.125 1.125 0 1 1 0 2.25 1.125 1.125 0 0 1 0-2.25z"/></svg>',
      title: 'List'
    };
  }

  /**
   * Render plugin`s main Element and fill it with saved data
   *
   * @param {{data: ListData, config: object, api: object}}
   *   data — previously saved data
   *   config - user config for Tool
   *   api - Editor.js API
   */
  constructor({ data, api }) {
    /**
     * HTML nodes
     * @private
     */
    this._elements = {
      wrapper: null,
    };

    this.settings = [
      {
        name: 'unordered',
        title: 'Unordered',
        icon: '<svg width="17" height="13" viewBox="0 0 17 13" xmlns="http://www.w3.org/2000/svg"> <path d="M5.625 4.85h9.25a1.125 1.125 0 0 1 0 2.25h-9.25a1.125 1.125 0 0 1 0-2.25zm0-4.85h9.25a1.125 1.125 0 0 1 0 2.25h-9.25a1.125 1.125 0 0 1 0-2.25zm0 9.85h9.25a1.125 1.125 0 0 1 0 2.25h-9.25a1.125 1.125 0 0 1 0-2.25zm-4.5-5a1.125 1.125 0 1 1 0 2.25 1.125 1.125 0 0 1 0-2.25zm0-4.85a1.125 1.125 0 1 1 0 2.25 1.125 1.125 0 0 1 0-2.25zm0 9.85a1.125 1.125 0 1 1 0 2.25 1.125 1.125 0 0 1 0-2.25z"/></svg>',
        default: false
      },
      {
        name: 'ordered',
        title: 'Ordered',
        icon: '<svg width="17" height="13" viewBox="0 0 17 13" xmlns="http://www.w3.org/2000/svg"><path d="M5.819 4.607h9.362a1.069 1.069 0 0 1 0 2.138H5.82a1.069 1.069 0 1 1 0-2.138zm0-4.607h9.362a1.069 1.069 0 0 1 0 2.138H5.82a1.069 1.069 0 1 1 0-2.138zm0 9.357h9.362a1.069 1.069 0 0 1 0 2.138H5.82a1.069 1.069 0 0 1 0-2.137zM1.468 4.155V1.33c-.554.404-.926.606-1.118.606a.338.338 0 0 1-.244-.104A.327.327 0 0 1 0 1.59c0-.107.035-.184.105-.234.07-.05.192-.114.369-.192.264-.118.475-.243.633-.373.158-.13.298-.276.42-.438a3.94 3.94 0 0 1 .238-.298C1.802.019 1.872 0 1.975 0c.115 0 .208.042.277.127.07.085.105.202.105.351v3.556c0 .416-.15.624-.448.624a.421.421 0 0 1-.32-.127c-.08-.085-.121-.21-.121-.376zm-.283 6.664h1.572c.156 0 .275.03.358.091a.294.294 0 0 1 .123.25.323.323 0 0 1-.098.238c-.065.065-.164.097-.296.097H.629a.494.494 0 0 1-.353-.119.372.372 0 0 1-.126-.28c0-.068.027-.16.081-.273a.977.977 0 0 1 .178-.268c.267-.264.507-.49.722-.678.215-.188.368-.312.46-.371.165-.11.302-.222.412-.334.109-.112.192-.226.25-.344a.786.786 0 0 0 .085-.345.6.6 0 0 0-.341-.553.75.75 0 0 0-.345-.08c-.263 0-.47.11-.62.329-.02.029-.054.107-.101.235a.966.966 0 0 1-.16.295c-.059.069-.145.103-.26.103a.348.348 0 0 1-.25-.094.34.34 0 0 1-.099-.258c0-.132.031-.27.093-.413.063-.143.155-.273.279-.39.123-.116.28-.21.47-.282.189-.072.411-.107.666-.107.307 0 .569.045.786.137a1.182 1.182 0 0 1 .618.623 1.18 1.18 0 0 1-.096 1.083 2.03 2.03 0 0 1-.378.457c-.128.11-.344.282-.646.517-.302.235-.509.417-.621.547a1.637 1.637 0 0 0-.148.187z"/></svg>',
        default: true
      }
    ];

    /**
     * Tool's data
     * @type {ListData}
     * */
    this._data = {
      style: this.settings.find(tune => tune.default === true).name,
      items: []
    };

    this.api = api;
    this.data = data;
  }

  /**
   * Returns list tag with items
   * @return {Element}
   * @public
   */
  render() {
    const style = this._data.style === 'ordered' ? this.CSS.wrapperOrdered : this.CSS.wrapperUnordered;

    this._elements.wrapper = this._make('ul', [this.CSS.baseBlock, this.CSS.wrapper, style], {
      contentEditable: true
    });

    const newItem = (content = '') => {
      return this._make('li', this.CSS.item, { innerHTML: content });
    };

    // fill with data
    if (this._data.items.length) {
      this._data.items.forEach(item => this._elements.wrapper.appendChild(newItem(item)));
    }
    else {
      this._elements.wrapper.appendChild(newItem());
    }

    // detect keydown on the last item to escape List
    this._elements.wrapper.addEventListener('input', inputHandler);
    this._elements.wrapper.addEventListener('keydown', event => {
      if (event.code === 'Enter') {
        const children = Array.from(event.target.children);
        const isFirstItem = this.currentItem === children[0];
        const isLastItem = this.currentItem === children.pop();
        const isEmpty = this.currentItem.innerText.trim().length === 0;

        if (!isFirstItem && isLastItem && isEmpty) {
          event.preventDefault();

          const { getBlockByIndex, getCurrentBlockIndex, getBlocksCount, insert } = this.api.blocks;
          const nextBlock = () => getBlockByIndex(currentBlockIndex + 1);
          const currentBlockIndex = getCurrentBlockIndex();
          const requireNewBlock = getBlocksCount() === currentBlockIndex + 1 || nextBlock().innerText.trim().length;

          this.currentItem.remove();

          if (requireNewBlock) {
            insert();
          }

          nextBlock().querySelector('.cdx-block').focus();
        }
      }
      else deleteHandler(event);
    });
    // this._elements.wrapper.addEventListener('keydown', event => {

    // const [ENTER, BACKSPACE] = [13, 8]; // key codes

    // switch (event.keyCode) {
    //   case ENTER:
    //     this.getOutofList(event);
    //     break;
    //   case BACKSPACE:
    //     this.backspace(event);
    //     break;
    // }
    // });

    return this._elements.wrapper;
  }

  /**
   * @return {ListData}
   * @public
   */
  save() {
    return this.data;
  }

  /**
   * Allow List Tool to be converted to/from other block
   */
  // static get conversionConfig() {
  //   return {
  //     /**
  //      * To create exported string from list, concatenate items by dot-symbol.
  //      * @param {ListData} data
  //      * @return {string}
  //      */
  //     export: (data) => {
  //       return data.items.join('. ');
  //     },
  //     /**
  //      * To create a list from other block's string, just put it at the first item
  //      * @param string
  //      * @return {ListData}
  //      */
  //     import: (string) => {
  //       return {
  //         items: [string],
  //         style: 'unordered'
  //       };
  //     }
  //   };
  // }

  /**
   * Sanitizer rules
   */
  static get sanitize() {
    return {
      style: {},
      items: {
        br: true,
        span: true,
        code: true,
      }
    };
  }

  /**
   * Settings
   * @public
   */
  renderSettings() {
    const wrapper = this._make('div', [this.CSS.settingsWrapper], {});

    this.settings.forEach((item) => {
      const itemEl = this._make('div', this.CSS.settingsButton, {
        innerHTML: item.icon
      });

      itemEl.addEventListener('click', () => {
        this.toggleTune(item.name);

        // clear other buttons
        const buttons = itemEl.parentNode.querySelectorAll('.' + this.CSS.settingsButton);

        Array.from(buttons).forEach(button => button.classList.remove(this.CSS.settingsButtonActive));

        // mark active
        itemEl.classList.toggle(this.CSS.settingsButtonActive);
      });

      if (this._data.style === item.name) {
        itemEl.classList.add(this.CSS.settingsButtonActive);
      }

      wrapper.appendChild(itemEl);
    });

    return wrapper;
  }

  /**
   * On paste callback that is fired from Editor
   *
   * @param {PasteEvent} event - event with pasted data
   */
  onPaste(event) {
    const list = event.detail.data;

    this.data = this.pasteHandler(list);
  }

  /**
   * List Tool on paste configuration
   * @public
   */
  static get pasteConfig() {
    return {
      tags: ['OL', 'UL', 'LI'],
    };
  }

  /**
   * Toggles List style
   * @param {string} style - 'ordered'|'unordered'
   */
  toggleTune(style) {
    this._elements.wrapper.classList.toggle(this.CSS.wrapperOrdered, style === 'ordered');
    this._elements.wrapper.classList.toggle(this.CSS.wrapperUnordered, style === 'unordered');

    this._data.style = style;
  }

  /**
   * Styles
   * @private
   */
  get CSS() {
    return {
      baseBlock: this.api.styles.block,
      wrapper: 'cdx-list',
      wrapperOrdered: 'cdx-list--ordered',
      wrapperUnordered: 'cdx-list--unordered',
      item: 'cdx-list__item',
      settingsWrapper: 'cdx-list-settings',
      settingsButton: this.api.styles.settingsButton,
      settingsButtonActive: this.api.styles.settingsButtonActive,
    };
  }

  /**
   * List data setter
   * @param {ListData} listData
   */
  set data(listData) {
    if (!listData) {
      listData = {};
    }

    this._data.style = listData.style || this.settings.find(tune => tune.default === true).name;
    this._data.items = listData.items || [];

    const oldView = this._elements.wrapper;

    if (oldView) {
      oldView.parentNode.replaceChild(this.render(), oldView);
    }
  }

  /**
   * Return List data
   * @return {ListData}
   */
  get data() {
    this._data.items = [];

    const items = this._elements.wrapper.querySelectorAll(`.${this.CSS.item}`);

    for (let i = 0; i < items.length; i++) {
      const value = items[i].innerHTML.replace('<br>', ' ').trim();

      if (value) {
        this._data.items.push(items[i].innerHTML);
      }
    }

    return this._data;
  }

  /**
   * Helper for making Elements with attributes
   *
   * @param  {string} tagName           - new Element tag name
   * @param  {array|string} classNames  - list or name of CSS classname(s)
   * @param  {Object} attributes        - any attributes
   * @return {Element}
   */
  _make(tagName, classNames = null, attributes = {}) {
    let el = document.createElement(tagName);

    if (Array.isArray(classNames)) {
      el.classList.add(...classNames);
    } else if (classNames) {
      el.classList.add(classNames);
    }

    for (let attrName in attributes) {
      el[attrName] = attributes[attrName];
    }

    return el;
  }

  /**
   * Returns current List item by the caret position
   * @return {Element}
   */
  get currentItem() {
    let currentNode = window.getSelection().anchorNode;

    if (currentNode.nodeType !== Node.ELEMENT_NODE) {
      currentNode = currentNode.parentNode;
    }

    return currentNode.closest(`.${this.CSS.item}`);
  }

  /**
   * Get out from List Tool
   * by Enter on the empty last item
   * @param {KeyboardEvent} event
   */
  getOutofList(event) {
    const items = this._elements.wrapper.querySelectorAll('.' + this.CSS.item);

    /**
     * Save the last one.
     */
    if (items.length < 2) {
      return;
    }

    const lastItem = items[items.length - 1];
    const currentItem = this.currentItem;
    const _ = undefined;

    /** Prevent Default li generation if item is empty */
    if (currentItem === lastItem && !lastItem.textContent.trim().length) {
      /** Insert New Block and set caret */
      currentItem.parentElement.removeChild(currentItem);
      this.api.blocks.insert();
      event.preventDefault();
      event.stopPropagation();
    }
  }

  /**
   * Handle backspace
   * @param {KeyboardEvent} event
   */
  backspace(event) {
    const items = this._elements.wrapper.querySelectorAll('.' + this.CSS.item),
      firstItem = items[0];

    if (!firstItem) {
      return;
    }

    /**
     * Save the last one.
     */
    if (items.length < 2 && !firstItem.innerHTML.replace('<br>', ' ').trim()) {
      event.preventDefault();
    }
  }

  /**
   * Select LI content by CMD+A
   * @param {KeyboardEvent} event
   */
  selectItem(event) {
    event.preventDefault();

    const selection = window.getSelection(),
      currentNode = selection.anchorNode.parentNode,
      currentItem = currentNode.closest('.' + this.CSS.item),
      range = new Range();

    range.selectNodeContents(currentItem);

    selection.removeAllRanges();
    selection.addRange(range);
  }

  /**
   * Handle UL, OL and LI tags paste and returns List data
   *
   * @param {HTMLUListElement|HTMLOListElement|HTMLLIElement} element
   * @returns {ListData}
   */
  pasteHandler(element) {
    const { tagName: tag } = element;
    let type;

    switch (tag) {
      case 'OL':
        type = 'ordered';
        break;
      case 'UL':
      case 'LI':
        type = 'unordered';
    }

    const data = {
      type,
      items: []
    };

    if (tag === 'LI') {
      data.items = [element.innerHTML];
    } else {
      const items = Array.from(element.querySelectorAll('LI'));

      data.items = items.map(li => li.innerHTML).filter(item => !!item.trim());
    }

    return data;
  }
}