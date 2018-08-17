class App {
    constructor() {}

    gcs(el, p) {
        return parseFloat(window.getComputedStyle(el).getPropertyValue(p));
    }
}