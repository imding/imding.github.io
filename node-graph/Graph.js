class Graph extends App {
    constructor(parent) {
        super();

        this.parent = parent;
        this.width = this.gcs(parent, 'width');
        this.height = this.gcs(parent, 'height');

        this.el = this.parent.appendChild(document.createElement('svg'));
        this.el.viewBox = `0 0 ${this.width} ${this.height}`;
    }
}