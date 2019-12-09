export function inputHandler(event: InputEvent) {
    if (event.data !== '`') return;
    
    const div = event.target as HTMLElement;
    const tickPair = window.getSelection().anchorNode.textContent.match(/`([^`]+)`/);

    if (!tickPair) return;
    
    const code = document.createElement('code');
    const zwsp = document.createTextNode('\u200B');
    const [term, content] = tickPair;
    const selectTerm = () => {
        const sel = document.getSelection();
        const range = document.createRange();
        const rootOpts = {
            replaceWith: (...nodes) => {
                range.extractContents();
                nodes.reverse().forEach(node => range.insertNode(node));
                div.normalize();

                return opts;
            }
        };
        const opts = {
            collapse: (toStart = false) => range.collapse(toStart)
        };

        range.setStart(sel.anchorNode, tickPair.index);
        range.setEnd(sel.anchorNode, tickPair.index + term.length);
        sel.removeAllRanges();
        sel.addRange(range);

        return rootOpts;
    };

    code.classList.add('inline-code');
    code.innerText = `\u200B${content}`;

    selectTerm().replaceWith(code, zwsp).collapse(true);

    if (div.lastChild === zwsp) {
        const sel = document.getSelection();
        const range = document.createRange();

        range.setStart(div.lastChild, 1);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
    }
}

export function deleteHandler(event: KeyboardEvent) {
    const { anchorNode, anchorOffset } = document.getSelection();
    const isCode = node => node.classList.contains('inline-code');

    if (event.code === 'Delete') {
        const atEdge = anchorOffset === anchorNode.textContent.length;
        const forwardDelete = isCode(anchorNode.parentNode) && atEdge;
        const backwardDelete = anchorNode.nextSibling && isCode(anchorNode.nextSibling) && atEdge;

        if (forwardDelete || backwardDelete) event.preventDefault();
    }

    else if (event.code === 'Backspace') {
        const atEdge = anchorOffset === 1;
        const forwardDelete = isCode(anchorNode.parentNode) && atEdge;
        const backwardDelete = anchorNode.nodeValue && anchorNode.nodeValue.startsWith('\u200B') && atEdge;

        if (forwardDelete || backwardDelete) event.preventDefault();
    }
}