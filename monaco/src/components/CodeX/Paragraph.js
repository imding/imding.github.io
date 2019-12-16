/**
 * Base Paragraph Block for the Editor.js.
 * Represents simple paragraph
 *
 * @author CodeX (team@ifmo.su)
 * @copyright CodeX 2018
 * @license The MIT License (MIT)
 * @version 2.0.0
 */

/**
 * @typedef {Object} ParagraphData
 * @description Tool's input and output data format
 * @property {String} text — Paragraph's content. Can include HTML tags: <a><b><i>
 */

import { inputHandler, deleteHandler } from './keyboardHandler';

export default class Paragraph {
    /**
     * Default placeholder for Paragraph Tool
     *
     * @return {string}
     * @constructor
     */
    static get DEFAULT_PLACEHOLDER() {
        return '';
    }

    /**
     * Render plugin`s main Element and fill it with saved data
     *
     * @param {{data: ParagraphData, config: object, api: object}}
     *   data — previously saved data
     *   config - user config for Tool
     *   api - Editor.js API
     */
    constructor({ data, config, api }) {
        this.api = api;

        this._CSS = {
            block: this.api.styles.block,
            wrapper: 'ce-paragraph'
        };
        this.onKeyUp = this.onKeyUp.bind(this);

        /**
         * Placeholder for paragraph if it is first Block
         * @type {string}
         */
        this._placeholder = config.placeholder ? config.placeholder : Paragraph.DEFAULT_PLACEHOLDER;
        this._data = {};
        this._element = this.drawView();

        this.data = data;
    }

    /**
     * Check if text content is empty and set empty string to inner html.
     * We need this because some browsers (e.g. Safari) insert <br> into empty contenteditanle elements
     *
     * @param {KeyboardEvent} e - key up event
     */
    onKeyUp(e) {
        if (e.code !== 'Backspace' && e.code !== 'Delete') {
            return;
        }

        const { textContent } = this._element;

        if (textContent === '') {
            this._element.innerHTML = '';
        }
    }

    /**
     * Create Tool's view
     * @return {HTMLElement}
     * @private
     */
    drawView() {
        const div = document.createElement('DIV');

        div.classList.add(this._CSS.wrapper, this._CSS.block);
        div.contentEditable = true;
        div.dataset.placeholder = this._placeholder;

        div.addEventListener('keyup', this.onKeyUp);
        div.addEventListener('input', inputHandler);
        div.addEventListener('keydown', deleteHandler);

        return div;
    }

    /**
     * Return Tool's view
     * @returns {HTMLDivElement}
     * @public
     */
    render() {
        return this._element;
    }

    /**
     * Method that specified how to merge two Text blocks.
     * Called by Editor.js by backspace at the beginning of the Block
     * @param {ParagraphData} data
     * @public
     */
    merge(data) {
        let newData = {
            text: this.data.text + data.text
        };

        this.data = newData;
    }

    /**
     * Validate Paragraph block data:
     * - check for emptiness
     *
     * @param {ParagraphData} savedData — data received after saving
     * @returns {boolean} false if saved data is not correct, otherwise true
     * @public
     */
    validate(savedData) {
        if (savedData.text.trim() === '') {
            return false;
        }

        return true;
    }

    /**
     * Extract Tool's data from the view
     * @param {HTMLDivElement} toolsContent - Paragraph tools rendered view
     * @returns {ParagraphData} - saved data
     * @public
     */
    save(toolsContent) {
        return {
            text: toolsContent.innerHTML.replace('&nbsp;', ' ')
        };
    }

    /**
     * On paste callback fired from Editor.
     *
     * @param {PasteEvent} event - event with pasted data
     */
    onPaste(event) {
        const data = {
            text: event.detail.data.innerHTML
        };

        this.data = data;
    }

    /**
     * Enable Conversion Toolbar. Paragraph can be converted to/from other tools
     */
    // static get conversionConfig() {
    //     return {
    //         export: 'text', // to convert Paragraph to other block, use 'text' property of saved data
    //         import: 'text' // to covert other block's exported string to Paragraph, fill 'text' property of tool data
    //     };
    // }

    /**
     * Sanitizer rules
     */
    static get sanitize() {
        return {
            text: {
                br: false,
                font: false,
                span: true,
                code: true,
            }
        };
    }

    /**
     * Get current Tools`s data
     * @returns {ParagraphData} Current data
     * @private
     */
    get data() {
        let text = this._element.innerHTML;

        this._data.text = text;

        return this._data;
    }

    /**
     * Store data in plugin:
     * - at the this._data property
     * - at the HTML
     *
     * @param {ParagraphData} data — data to set
     * @private
     */
    set data(data) {
        this._data = data || {};

        this._element.innerHTML = this._data.text || '';
    }

    /**
     * Used by Editor paste handling API.
     * Provides configuration to handle P tags.
     *
     * @returns {{tags: string[]}}
     */
    static get pasteConfig() {
        return {
            tags: ['P']
        };
    }

    // static get toolbox() {
    //     return {
    //         title: 'Paragraph',
    //         icon: '<svg width="17" height="15" xmlns="http://www.w3.org/2000/svg"><path d="m1.20358,12.36428l9.72856,0l0,-1.62143l-9.72856,0l0,1.62143zm0,-9.72856l0,1.62143l14.59284,0l0,-1.62143l-14.59284,0zm0,5.675l14.59284,0l0,-1.62143l-14.59284,0l0,1.62143z"/></svg>'
    //     };
    // }
}
