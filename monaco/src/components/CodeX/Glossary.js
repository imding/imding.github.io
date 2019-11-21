
class Glossary {
    constructor(api, type, icon) {
        this.api = api;
        this.button = null;
        this.icon = icon;
        this.tooltip = `${type.toUpperCase()} Glossary Link`;
        this.css = `${type}-glossary`;
        this.tag = 'SPAN';
        this.iconClasses = {
            base: this.api.styles.inlineToolButton,
            active: this.api.styles.inlineToolButtonActive
        };
    }
    
    static get isInline() {
        return true;
    }

    static get sanitize() {
        return {
            code: {
                class: this.css
            }
        };
    }

    render() {
        this.button = document.createElement('button');
        this.button.type = 'button';
        this.button.classList.add(this.iconClasses.base);
        this.button.innerHTML = this.icon;
        this.button.title = this.tooltip;

        return this.button;
    }

    surround(range) {
        if (!range) {
            return;
        }

        let termWrapper = this.api.selection.findParentTag(this.tag, this.css);

        if (termWrapper) {
            this.unwrap(termWrapper);
        }
        else {
            this.wrap(range);
        }
    }

    wrap(range) {
        let span = document.createElement(this.tag);

        span.classList.add('glossary', this.css);
        span.appendChild(range.extractContents());
        range.insertNode(span);

        this.api.selection.expandToTag(span);

        const parent = range.commonAncestorContainer;

        parent.childNodes.forEach(node => {
            if (node.nodeType === 3 && node.data === '') {
                parent.removeChild(node);
            }
        });
    }

    unwrap(termWrapper) {
        this.api.selection.expandToTag(termWrapper);

        let sel = window.getSelection();
        let range = sel.getRangeAt(0);
        let unwrappedContent = range.extractContents();

        termWrapper.parentNode.removeChild(termWrapper);
        range.insertNode(unwrappedContent);
        sel.removeAllRanges();
        sel.addRange(range);
    }

    checkState() {
        const termTag = this.api.selection.findParentTag(this.tag, this.css);
        this.button.classList.toggle(this.iconClasses.active, !!termTag);
    }
}

const wrapper = {
    open: '<svg width="15" height="15" xmlns="http://www.w3.org/2000/svg"><path d="m',
    close: 'z"/></svg>'
};
const htmlIcon = `${wrapper.open}1.64062,0.66405l1.06506,12.07887l4.77906,1.59302l4.80958,-1.59302l1.06506,-12.07887l-11.71876,0zm9.40553,3.9032l-5.60914,0l0.12512,1.50757l5.35889,0l-0.41504,4.52881l-2.98767,0.82398l0,0.00916l-0.03357,0l-3.01209,-0.83313l-0.18311,-2.31324l1.45569,0l0.10681,1.16272l1.63269,0.44251l1.6388,-0.44251l0.18311,-1.8982l-5.09339,0l-0.39063,-4.44336l7.3578,0l-0.13428,1.45569${wrapper.close}`;
const cssIcon = `${wrapper.open}1.53173,0.53702l1.08486,12.30333l4.88341,1.62262l4.88341,-1.62262l1.08486,-12.30333l-11.93653,0zm9.73262,2.48678l-0.14921,1.47031l-3.58407,1.53248l-0.00933,0.00311l3.46595,0l-0.39788,4.55702l-3.05252,0.89213l-3.07117,-0.90767l-0.19894,-2.29716l1.52004,0l0.09947,1.19054l1.63506,0.41343l1.70033,-0.4787l0.11501,-1.91482l-5.16939,-0.01554l0,-0.00311l-0.00622,0.00311l-0.1119,-1.43922l3.4846,-1.45166l0.20205,-0.08393l-3.82031,0l-0.18029,-1.47031l7.52872,0${wrapper.close}`;
const jsIcon = `${wrapper.open}12.5325,1.095l-10.06501,0c-0.75773,0 -1.3725,0.61477 -1.3725,1.3725l0,10.06501c0,0.75773 0.61477,1.3725 1.3725,1.3725l10.06501,0c0.75773,0 1.3725,-0.61477 1.3725,-1.3725l0,-10.06501c0,-0.75773 -0.61477,-1.3725 -1.3725,-1.3725zm-4.46635,9.99066c0,1.24669 -0.732,1.8157 -1.79855,1.8157c-0.96361,0 -1.52119,-0.49753 -1.80713,-1.10086l0.98077,-0.59189c0.18872,0.33455 0.36028,0.61763 0.77489,0.61763c0.39459,0 0.64622,-0.15441 0.64622,-0.75773l0,-4.09177l1.2038,0l0,4.10892zm2.84794,1.8157c-1.11802,0 -1.84144,-0.53184 -2.19314,-1.22953l0.98077,-0.56616c0.25734,0.42033 0.59475,0.732 1.18664,0.732c0.49753,0 0.81778,-0.24877 0.81778,-0.59475c0,-0.41175 -0.32597,-0.55758 -0.87783,-0.80063l-0.30023,-0.12867c-0.86925,-0.36886 -1.44399,-0.83494 -1.44399,-1.8157c0,-0.90356 0.68911,-1.58981 1.76138,-1.58981c0.76631,0 1.31531,0.26592 1.70991,0.96361l-0.93788,0.60047c-0.20588,-0.36886 -0.42891,-0.51469 -0.77489,-0.51469c-0.3517,0 -0.57473,0.22303 -0.57473,0.51469c0,0.36028 0.22303,0.50611 0.74058,0.732l0.30023,0.12867c1.02366,0.43748 1.59839,0.88641 1.59839,1.89291c0,1.08084 -0.85209,1.67559 -1.99299,1.67559${wrapper.close}`;

export class HtmlGlossary extends Glossary {
    constructor({ api }) {
        super(api, 'html', htmlIcon);
    }
}

export class CssGlossary extends Glossary {
    constructor({ api }) {
        super(api, 'css', cssIcon);
    }
}

export class JsGlossary extends Glossary {
    constructor({ api }) {
        super(api, 'javascript', jsIcon);
    }
}
