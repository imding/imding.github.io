

export default class App {
    root: HTMLElement;
    UI: Object;

    constructor(cfg: { root: HTMLElement, UI: Object }) {
        this.root = cfg.root;
        this.UI = cfg.UI;

        return this;
    }
}