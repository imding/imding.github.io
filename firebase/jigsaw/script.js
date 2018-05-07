// minimum resolution of the puzzle
var grid = 2;
// 90% of window width
var maxWidth = 0.9;
// 30% of window height
var maxHeight = 0.3;
// array holding all the puzzle pieces
var puzzle = [];
// array of grids ( where pieces go )
var puzzleGrid = [];
// the puzzle image
var image;
// actual resolution of the puzzle i.e 2 x 3
var resolution;
// index of the puzzle pieces being picked up
var activeIndex;
// index of the grid that is being hovered over
var activeGrid;
// the location of the active piece before being picked up
var secondaryLocation;
var bg = { wrapper: null, image: null };
var mouseDown = false;
var popup;

// ===== FUNCTIONS ===== //

function setBackground() {
    if (!Array.from(document.body.children).includes(bg.wrapper)) {
        bg.wrapper = document.createElement('div');
        bg.image = document.createElement('img');

        bg.wrapper.appendChild(bg.image);
        document.body.appendChild(bg.wrapper);

        style([bg.wrapper], {
            position: 'absolute',
            left: '0',
            top: '0',
            width: '100%',
            height: '100%',
            background: 'black',
            opacity: '0.75',
            overflow: 'hidden',
            z_index: '-2',
        });
    }

    bg.image.src = image.src;

    style([bg.image], {
        position: 'relative',
        width: window.innerWidth > bg.image.width ? '110%' : '',
        height: window.innerHeight > bg.image.height ? '110%' : '',
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        filter: 'grayscale(0.5) blur(10px)',
    });
}

function loadImage() {
    showPopup('Loading Image...');

    const checkLoadStatus = setTimeout(function () {
        if (document.body.contains(popup.element)) {
            document.body.removeChild(popup.element);
            showPopup(
                "Couldn't load the image after 10 seconds, please make sure the image link is correct.",
                'Okay',
                () => document.body.removeChild(popup.element)
            );
        }
    }, 10000);

    image = document.createElement('img');
    image.src = link.value;

    image.onload = () => {
        clearTimeout(checkLoadStatus);
        document.body.removeChild(popup.element);

        const ir = image.width / image.height;

        resolution = [
            ir >= 0 ? Math.round(grid * ir) : grid,
            ir >= 0 ? grid : Math.round(grid * ir),
        ];

        setBackground();
        initialze();
    };
}

function initialze() {
    generatePuzzle();
    shuffle(puzzle);

    tray.style.height = `${window.innerHeight - tray.offsetTop}px`;

    puzzle.forEach((piece, i) => {
        puzzleContainer.appendChild(piece);
        piece.location = puzzleGrid[i];

        // put random pieces into the tray area
        if (Math.random() > 0.7) {
            puzzleGrid[i].isEmpty = false;
            piece.style.left = puzzleGrid[i].x;
            piece.style.top = puzzleGrid[i].y;
        }
        else {
            puzzleGrid[i].isEmpty = true;
            piece.style.left = range(10, puzzleContainer.offsetWidth - piece.offsetWidth - 10) + 'px';
            piece.style.top = range(tray.offsetTop, window.innerHeight - puzzleContainer.offsetTop - piece.offsetHeight) - 20 + 'px';
        }
    });
}

function generatePuzzle() {
    const
        hr = window.innerWidth * maxWidth / image.width,
        vr = window.innerHeight * maxHeight / image.height,
        r = Math.min(hr, vr);

    // loop to create all pieces in the puzzle
    for (let i = 0; i < resolution[0] * resolution[1]; i++) {
        const
            piece = document.createElement('div'),
            x = i % resolution[0] * (image.width * r / resolution[0]),
            y = Math.floor(i / resolution[0]) * (image.height * r / resolution[1]);

        piece.id = `piece${i}`;
        piece.className = 'piece';
        piece.style.width = `${image.width * r / resolution[0]}px`;
        piece.style.height = `${image.height * r / resolution[1]}px`;
        piece.style.backgroundImage = `url(${image.src})`;
        piece.style.backgroundSize = `${image.width * r}px  ${image.height * r}px`;
        piece.style.backgroundPosition = `-${x}px -${y}px`;
        piece.style.zIndex = '0';

        // store each piece in an array
        puzzle.push(piece);
        puzzleGrid.push({ x: `${x}px`, y: `${y}px`, isEmpty: true, index: i });
    }

    puzzleContainer.style.width = `${image.width * r}px`;
    puzzleContainer.style.height = `${image.height * r}px`;
}

function shuffle(array) {
    let counter = array.length;

    // While there are elements in the array
    while (counter > 0) {
        // Pick a random index
        let index = Math.floor(Math.random() * counter);

        // Decrease counter by 1
        counter--;

        // And swap the last element with it
        let temp = array[counter];
        array[counter] = array[index];
        array[index] = temp;
    }
}

function selectPiece(target) {
    if (!Number.isInteger(activeIndex)) {
        activeIndex = puzzle.includes(target) ? puzzle.indexOf(target) : null;

        if (Number.isInteger(activeIndex)) {
            console.clear();
            console.log('Active:', puzzle[activeIndex].id, `puzzle[${puzzle[activeIndex].location.index}]`);

            puzzle.forEach(piece => {
                if (piece) piece.style.zIndex = '0';
            });
            puzzle[activeIndex].style.zIndex = '1';

            if (puzzleGrid[activeIndex].isEmpty) secondaryLocation = { x: puzzle[activeIndex].offsetLeft + 'px', y: puzzle[activeIndex].offsetTop + 'px' };

            let s = puzzleGrid[activeIndex].isEmpty;
            puzzleGrid[activeIndex].isEmpty = true;

            console.log('Picked up from', puzzleGrid[activeIndex], puzzleGrid[activeIndex].isEmpty);
            console.log(`puzzle[${activeIndex}].isEmpty: ${s} => ${puzzleGrid[activeIndex].isEmpty}`);
        }
    }
}

function movePiece(clientX, clientY) {
    if (Number.isInteger(activeIndex)) {
        const
            offsetX = clientX - puzzleContainer.offsetLeft,
            offsetY = clientY - puzzleContainer.offsetTop,
            piece = puzzle[activeIndex].getBoundingClientRect();

        activeGrid = puzzleGrid[Math.floor(offsetY / piece.height) * resolution[0] + Math.floor(offsetX / piece.width)];

        puzzle[activeIndex].style.transitionDuration = '0s';
        puzzle[activeIndex].style.left = `${offsetX - puzzle[activeIndex].offsetWidth / 2}px`;
        puzzle[activeIndex].style.top = `${offsetY - puzzle[activeIndex].offsetHeight / 2}px`;

        console.clear();
        console.log('Picked up from', puzzleGrid[activeIndex]);
        console.log(`puzzle[${activeIndex}].isEmpty: ${puzzleGrid[activeIndex].isEmpty}`);

        if (activeGrid) console.log('Hovering above', activeGrid);
        else console.log('Hovering outside puzzle.');
    }
}

function dropPiece(clientX, clientY) {
    if (Number.isInteger(activeIndex)) {
        if (activeGrid && activeGrid.isEmpty) {
            placePiece(activeGrid);
        }
        else {
            const
                h = clientX >= tray.offsetLeft && clientX <= tray.offsetLeft + tray.offsetWidth,
                v = clientY >= tray.offsetTop + puzzle[activeIndex].offsetHeight / 2 && clientY <= tray.offsetTop + tray.offsetHeight;

            // if dropped inside the tray area
            if (h && v) {
                placePiece({ x: `${puzzle[activeIndex].offsetLeft}px`, y: `${puzzle[activeIndex].offsetTop}px` });
                console.log('Dropped in tray.');
            }
            else {
                placePiece(secondaryLocation || puzzle[activeIndex].location);
                secondaryLocation = null;
            }
        }
        activeIndex = null;
    }
}

function placePiece(target) {
    puzzle[activeIndex].style.transitionDuration = '0.2s';
    puzzle[activeIndex].style.left = target.x;
    puzzle[activeIndex].style.top = target.y;

    if (target.hasOwnProperty('index')) {
        let s = puzzleGrid[target.index].isEmpty;
        puzzleGrid[target.index].isEmpty = false;
        console.log(`puzzleGrid[${target.index}].isEmpty: ${s} => ${puzzleGrid[target.index].isEmpty}`);

        s = puzzle[activeIndex].location;
        puzzle[activeIndex].location = target;
        console.log(`puzzle[${activeIndex}].location:`, s, '=>', puzzle[activeIndex].location);

        // swap pieces in the puzzle array
        const swap = puzzle[target.index];
        puzzle[target.index] = puzzle[activeIndex];
        puzzle[activeIndex] = swap;

        checkPuzzle();
    }
}

function checkPuzzle() {
    let pass = puzzle.every((piece, i) => {
        return piece.id == `piece${i}`;
    });

    // solved current puzzle
    if (pass && puzzleGrid.every(grid => !grid.isEmpty)) {
        showPopup(
            'Congratulations!<br>You solved the puzzles!<br>',
            'Okay',
            () => {
                document.body.removeChild(popup.element);
                resetPuzzle();
            }
        );
    }
}

function resetPuzzle() {
    image = null;
    puzzle.forEach(piece => puzzleContainer.removeChild(piece));

    puzzle = [];
    puzzleGrid = [];
    activeIndex = null;
    activeGrid = null;
    mouseDown = false;

    loadImage();
}

function showPopup(messageContent, buttonText, action, close = false, closeAction) {
    const
        wrapper = document.createElement('div'),
        logo = document.createElement('img'),
        message = document.createElement('h2'),
        button = document.createElement('button'),
        btnClose = document.createElement('button');

    popup = {
        element: document.createElement('div'),
        wrapper: wrapper,
        message: message,
        button: button,
        logo: logo,
    };

    logo.src = 'https://app.bsdlaunchbox.com/resources/bsdlogo.png';
    message.innerHTML = messageContent;

    wrapper.appendChild(message);

    if (buttonText) {
        button.textContent = buttonText;
        button.onclick = action;
        wrapper.appendChild(button);
        if (close) {
            style([btnClose], { margin_left: '10px' });
            btnClose.textContent = 'Cancel';
            btnClose.onclick = closeAction;
            wrapper.appendChild(btnClose);
        }
    }

    document.body.appendChild(popup.element);
    popup.element.appendChild(wrapper);

    style([popup.element], {
        position: 'absolute',
        top: '0',
        width: `${window.innerWidth}px`,
        height: `${window.innerHeight}px`,
        background_color: 'rgba(255, 255, 255, 0.8)',
        z_index: '2',
    });

    style([wrapper], {
        position: 'absolute',
        width: `${window.innerWidth - 50}px`,
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        border_radius: '10px',
        padding: '0 20px 20px 20px',
        background_color: 'rgba(0, 0, 0, 0.8)',
        box_sizing: 'border-box',
    });

    style([message], {
        margin_top: '0',
        font_family: 'Monospace',
        color: 'ghostwhite',
        line_height: '1.5em',
    });

    if (buttonText || close) style([button, btnClose], {
        border: 'none',
        border_radius: `${button.offsetHeight / 2}px`,
        padding: '5px 10px',
        cursor: 'pointer',
        outline: 'none',
        font_family: 'Monospace',
        font_size: '1.2em',
        color: 'black',
        background_color: 'ghostwhite',
    });

    logo.onload = () => {
        style([logo], { opacity: '0' });
        popup.element.appendChild(logo);

        const sizeRatio = window.innerWidth * 0.15 / logo.offsetWidth;
        style([wrapper], { padding_top: `${10 + (logo.offsetHeight / 2) * sizeRatio}px` });
        style([logo], {
            position: 'absolute',
            left: '50%',
            transform: `translateX(-50%) scale(${sizeRatio}) `,
            top: `${wrapper.offsetTop - (wrapper.offsetHeight / 2) - (logo.offsetHeight / 2)}px`,
            opacity: '1',
        });
    };
}

// ===== EVENTS ===== //

update.onclick = resetPuzzle;

link.onfocus = () => {
    link.setSelectionRange(0, link.value.length);
};

window.onload = loadImage;

window.onresize = () => {
    style([spare], { height: `${window.innerHeight - tray.offsetTop}px` });

    if (popup) {
        style([popup.element], { height: `${window.innerHeight}px` });
        style([popup.logo], { top: `${popup.wrapper.offsetTop - (popup.wrapper.offsetHeight / 2) - (popup.logo.offsetHeight / 2)}px` });
    }
};

window.onmousedown = () => {
    mouseDown = true;
    selectPiece(event.target);
};

window.onmousemove = () => {
    if (mouseDown) movePiece(event.clientX, event.clientY);
};

window.onmouseup = () => {
    mouseDown = false;
    dropPiece(event.clientX, event.clientY);
};

window.ontouchstart = () => {
    if (event.touches.length === 1) selectPiece(event.target);
};

window.ontouchmove = () => {
    if (event.touches.length === 1) movePiece(event.touches[0].clientX, event.touches[0].clientY);
    // prevent default touch move functionalities such as overscrolling on iPhones
    event.preventDefault();
};

window.ontouchend = () => {
    dropPiece(event.changedTouches[0].clientX, event.changedTouches[0].clientY);
};

// ===== UTILITY ===== //

function range(min, max, int = false) {
    const r = Math.random() * (max - min) + min;
    return int ? Math.round(r) : r;
}

function style(elem, declarations) {
    Object.keys(declarations).forEach(d => {
        elem.forEach(e => {
            if (declarations[d]) e.style[d.replace(/_/, '-')] = declarations[d];
        });
    });
}