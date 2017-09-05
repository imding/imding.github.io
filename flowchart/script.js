/*
    gc = grid container
    gi = grid item
*/
let winWidth, winHeight,
gcMain, gcFlowchart, gcDeck, giNode, giCard,
activeNode, activeDeck, activeSelection,
arrSubHeader;
// searchBar;

Number.prototype.clamp = function(min, max) {
return Math.min(Math.max(this, min), max);
};

function camelize(str) {
return str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, function(match, i) {
    if (+match === 0) return "";        // (/\s+/.test(match)) for white spaces
    return i === 0 ? match.toLowerCase() : match.toUpperCase();
});
}

function toggleExpand(subHeader) {
let content = [subHeader.nextSibling];
/* grow the content array until next sub-header */
while (content[content.length - 1].nextSibling && content[content.length - 1].nextSibling.tagName != "H5") {
    content.push(content[content.length - 1].nextSibling);
}
/* get rid of empty tags and shade element */
content = content.filter((el) => { return (el.tagName && !el.className.includes("shade")) });
/* toggle display property */
content.forEach((el) => {
    if (el.style.display == "none") {
        el.style.display = "inherit";
    } else {
        el.style.display = "none";
    }
});
}

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
        setTimeout(() => { elem.style.borderLeft = "solid 5px #1D2533" }, 500);
    } else {
        document.execCommand('copy');
    }
} else {
    activeSelection = null;
}
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
searchBar = document.getElementById("searchBar");
giNode = Array.from(document.getElementsByClassName("node"));       // not all nodes are grid items
gcDeck = Array.from(document.getElementsByClassName("gcDeck"));
giCard = Array.from(document.getElementsByClassName("giCard"));
arrSubHeader = Array.from(document.getElementsByTagName("H5"));
/* assign font-awesome class names */
Array.from(document.getElementsByTagName("i")).forEach((iTag) => { iTag.classList.length === 0 ? iTag.classList.add("fa", "fa-info-circle") : null });
/* click-to-select */
Array.from(document.getElementsByTagName("code")).forEach((codeTag) => { codeTag.onclick = (evt) => { selectText(evt.target) } });
Array.from(document.getElementsByClassName("template")).forEach((template) => { template.onclick = (evt) => { selectText(evt.target) } });
/* click-to-expand */
arrSubHeader.forEach((subHeader) => { subHeader.onclick = () => { toggleExpand(subHeader) }; subHeader.click() });
/* dismiss search bar */
// searchBar.onblur = () => { searchBar.style.display = "none"; searchBar.value = "" };
/* store window size */
winWidth = window.innerWidth;
winHeight = window.innerHeight;
/* filter clickable nodes */
giNode = giNode.filter((node) => { return node.className.includes("active") });
/* nodes set up */
giNode.forEach((node, i, arr) => {
    node.onclick = (evt) => {               // add click event handler
        if (activeNode != evt.target.textContent) {
            showDeck(activeNode = evt.target.textContent);
            // snap adjust everything after new deck is displayed
            gcFlowchart.style.transition = "none";
            dynAdjust(evt.clientX);
            setTimeout(() => { gcFlowchart.style.transition = "left 0.2s ease-out" }, 50);
        }
    };
    /* add arrows after active nodes */
    if (!node.className.includes("inner") && i < giNode.length - 1) {
        let arrow = document.createElement("i");
        arrow.style.color = "palegreen";
        arrow.classList.add("fa", "fa-caret-right", "fa-lg");
        node.parentNode.insertBefore(arrow, node.nextSibling);
        /* add arrow before shell nodes */
        if (i > 0 && node.previousSibling.previousSibling.className.includes("shell")) {
            arrow = document.createElement("i");
            arrow.style.color = "palegreen";
            arrow.classList.add("fa", "fa-caret-right", "fa-lg");
            node.parentNode.insertBefore(arrow, node);
        }
    /* add arrows after inner active nodes */
    } else if (node.className.includes("inner") && arr[i + 1].className.includes("inner")) {
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

giNode[5].click();
window.dispatchEvent(new Event('resize'));
};

// window.onkeydown = (evt) => {
//     let c1 = (evt.keyCode >= 65 && evt.keyCode <= 90),  // a-z
//         c2 = evt.keyCode == 8,  // backspace
//         c3 = evt.keyCode == 27, // escape
//         c4 = (!searchBar.style.display || searchBar.style.display == "none");   // searchBar is hidden
    
//     if (c1 && c4) {
//         searchBar.style.display = "inherit";
//         searchBar.focus();
//     }
//     if ((c3 || (c2 && searchBar.value.length == 1)) && !c4) {
//         searchBar.style.display = "none";
//         searchBar.value = "";
//     }
//     if (evt.keyCode == 13 && searchBar.value.trim().length >= 3) {
//         search(searchBar.value.trim().toLowerCase());
//     }
// };

// function search(str) {
//     console.log(`searching for: "${str}"`);

//     giCard.forEach((card) => {
//         let cardChildren = Array.from(card.children),
//             location;
    
//         if (cardChildren[0].textContent.trim().toLowerCase().includes(str)) {
//             location = `${giNode[gcDeck.indexOf(card.parentNode)].textContent} > ${cardChildren[0].textContent}`;
//             giNode[gcDeck.indexOf(card.parentNode)].click();
//             dynAdjust(window.innerWidth / 2);
//         }
    
//         cardChildren.forEach((child, i) => {
//             if (i > 0 && child.textContent.trim().toLowerCase().includes(str)) {
//                 console.log(child);
//             }
//         });
//     });
// }