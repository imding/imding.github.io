/*
    gc = grid container
    gi = grid item
*/
let winWidth, winHeight, gcMain, gcFlowchart, gcDeck, giNode, giCard, activeNode, activeDeck, activeSelection, template;

Number.prototype.clamp = function(min, max) {
    return Math.min(Math.max(this, min), max);
};

function selectText(elem) {
    let selection = window.getSelection();
    let rangeObj = document.createRange();
    
    rangeObj.selectNodeContents(elem);
    
    if (elem != activeSelection) {
        activeSelection = elem;
        selection.removeAllRanges();
        selection.addRange(rangeObj);
        if (elem.tagName == "CODE") {
            document.execCommand('copy') ? elem.style.borderLeft = "solid 5px palegreen" : elem.style.borderLeft = "solid 5px indianred";
            setTimeout(() => { elem.style.borderLeft = "solid 5px #1D2533" }, 500)
        } else {
            document.execCommand('copy');
        }
    } else {
        activeSelection = null;
    }
}

function camelize(str) {
    return str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, function(match, i) {
        if (+match === 0) return "";        // (/\s+/.test(match)) for white spaces
        return i === 0 ? match.toLowerCase() : match.toUpperCase();
    });
}

function dynAdjust(refPoint, focus) {
    let c = [], scroll = [];
    /* conditions */
    c.push(gcFlowchart.offsetWidth >= activeDeck.offsetWidth);  // c[0] = flowchart wider than or same width as deck
    c.push(gcFlowchart.clientWidth > winWidth);                 // c[1] = flowchart clipped
    c.push(activeDeck.clientWidth > winWidth);                  // c[2] = deck clipped
    /* normalized scroll range */
    refPoint = (refPoint.clamp(winWidth * 0.2, winWidth * 0.8) - winWidth * 0.2) / (winWidth * 0.6);
    /* default scroll values */
    scroll[0] = refPoint * (winWidth - gcFlowchart.offsetWidth);
    scroll[1] = refPoint * (winWidth - activeDeck.offsetWidth);
    /* calculate flow-chart transform */
    if (c[1]) {
        c[0] ? null : scroll[0] -= ((activeDeck.offsetWidth - gcFlowchart.offsetWidth) / 2);
    } else if (!c[0] && !c[1] && c[2]) {
        scroll[0] = (activeDeck.offsetWidth - winWidth) / -2;
    } else {
        scroll[0] = 0;
    }
    /* calculate deck transform */
    if (c[2]) {
        c[0] ? scroll[1] -= ((gcFlowchart.offsetWidth - activeDeck.offsetWidth) / 2) : null;
    } else if (c[0] && c[1] && !c[2]) {
        scroll[1] = (gcFlowchart.offsetWidth - winWidth) / -2;
    } else {
        scroll[1] = 0;
    }
    /* animate stuff */
    window.requestAnimationFrame(() => {
        /* flow-chart & deck */
        (focus == gcFlowchart || !focus) ? gcFlowchart.style.left = `${scroll[0]}px` : null;
        (focus == activeDeck || !focus) ? activeDeck.style.left = `${scroll[1]}px` : null;
        if (!focus) {
            activeDeck.style.height = winHeight - activeDeck.offsetTop + "px";
        }
    });
}

function showDeck(name) {
    giNode.forEach((node, i) => {
        if (!node.className.includes("shell")) {
            giNode[i].style.borderLeft = (node.textContent == name) ? "solid 5px #B8D3FC" : "solid 5px #1D2533";
            giNode[i].style.borderRight = (node.textContent == name) ? "solid 5px #B8D3FC" : "solid 5px #1D2533";
        }
    });
    gcDeck.forEach((gc, i) => {
        if (gc.id == camelize(name)) {
            gc.style.display = "grid";
            activeDeck = gc;
        } else {
            gc.style.display = "none";
        }
    });
}

function addShades(card) {
    let shader = document.createElement("div");
    
    shader.classList.add("shade");
    card.appendChild(shader);
    card.onscroll = (evt) => {
        window.requestAnimationFrame(() => {
            shader.style.top = `${card.scrollTop}px`;
        });
    };
}

window.onload = () => {
    console.clear();
    gcFlowchart = document.getElementById("gcFlowchart");
    giNode = Array.from(document.getElementsByClassName("node"));       // not all nodes are grid items
    gcDeck = Array.from(document.getElementsByClassName("gcDeck"));
    giCard = Array.from(document.getElementsByClassName("giCard"));
    // template = Array.from(document.getElementsByClassName("template"));
    /* assign font-awesome class names */
    Array.from(document.getElementsByTagName("i")).forEach((iTag) => { iTag.classList.length === 0 ? iTag.classList.add("fa", "fa-info-circle") : null });
    /* click-to-select */
    Array.from(document.getElementsByTagName("code")).forEach((codeTag) => { codeTag.onclick = (evt) => { selectText(evt.target) } });
    Array.from(document.getElementsByClassName("template")).forEach((template) => { template.onclick = (evt) => { selectText(evt.target) } });
    /* store window size */
    winWidth = window.innerWidth;
    winHeight = window.innerHeight;
    /* flow-chart nodes set up */
    giNode.slice().reverse().forEach((node, i, arr) => {
        if (node.className.includes("active")) {    // filter clickable nodes
            node.onclick = (evt) => {               // add click event handler
                if (activeNode != evt.target.textContent) {
                    showDeck(activeNode = evt.target.textContent);
                    // snap adjust everything after new deck is displayed
                    gcFlowchart.style.transition = "none";
                    dynAdjust(evt.clientX);
                    setTimeout(() => { gcFlowchart.style.transition = "left 0.2s ease-out" }, 50);
                }
            };
        }
        /* add arrows between nodes */
        if (!node.className.includes("inner") && i > 0) {
            let arrow = document.createElement("i");
            arrow.style.color = "palegreen";
            arrow.classList.add("fa", "fa-caret-right", "fa-lg");
            node.parentNode.insertBefore(arrow, node.nextSibling);
        } else if (node.className.includes("inner") && arr[i - 1].className.includes("inner")) {
            let arrow = document.createElement("div");
            arrow.classList.add("arrow", "toBottom");
            node.parentNode.insertBefore(arrow, node.nextSibling);
        }
    });
    
    gcFlowchart.onmousemove = (evt) => { dynAdjust(evt.clientX, gcFlowchart) };
    gcDeck.forEach((deck) => { deck.onmousemove = (evt) => { dynAdjust(evt.clientX, activeDeck) } });
    giCard.forEach((card, i) => { addShades(card) });
    
    window.onresize = () => { 
        winWidth = window.innerWidth;
        winHeight = window.innerHeight;
        dynAdjust(winWidth / 2);
    };
    
    giNode[6].click();
    window.dispatchEvent(new Event('resize'));
};