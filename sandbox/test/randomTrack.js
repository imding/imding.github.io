var content = document.querySelector('#content');
var grid = document.querySelector('#grid');
var car = document.querySelector('#car');
var btnRun = document.querySelector('#btnRun');
var blockSize = 32;
var nColumn = 20;
var nRow = 10;
var trackBlocks = [];
var track = [];
var path = [];

window.onload = init;
window.onresize = resizeContent;
btnRun.onclick = autoPilot;

function init() {
    drawGrid();
    plotPath();

    //  place the car on the first block in the track
    moveCarTo(track.shift());

    //  handle the transitionend event using the nextCommand function
    car.addEventListener('transitionend', nextMove);

    resizeContent();
}

function autoPilot() {
    console.log(car.restingBlock.branches);
}

function goUp(n) {
    addToPath('up', n);
}

function goDown(n) {
    addToPath('down', n);
}

function goRight(n) {
    addToPath('right', n);
}

function addToPath(dir, n = 1) {
    //  start the car after receving the first command
    if (path.length == 0) {
        btnRun.disabled = true;
        btnRun.textContent = 'Ready...';
        
        setTimeout(() => {
            btnRun.textContent = 'Go!';
            nextMove();
        }, 1000);
    }

    while (n--) {
        var pathEnd = path[path.length - 1]||car.restingBlock;
        path.push(pathEnd[dir]);
    }
}

function nextMove() {
    if (path.length) {
        var nextBlock = path.shift();

        if (nextBlock) {
            if (nextBlock != track.shift()) {
                fail('Your algorithm led the car off track.');
            }
            
            moveCarTo(nextBlock);
        }
        else {
            fail('Your algorithm tries to lead the car off the grid.');
        }
    }
    else {
        checkResult();
    }
}

function checkResult() {
    if (car.restingBlock == track[track.length - 1]) {
        trackBlocks.forEach(row => row.forEach(block => grid.removeChild(block)));

        trackBlocks = [];
        track = [];
        path = [];

        init();
        
        console.log('Congratulations! You reached the finish line.');
        btnRun.disabled = false;
        btnRun.textContent = 'Run Algorithm';
    }
    else {
        fail('Your algorithm did not lead the car to the finish line.');
    }
}

function fail(msg) {
    car.removeEventListener('transitionend', nextMove);

    setTimeout(() => {
        moveCarTo(car);
        console.log(msg);
    }, 100);
}

function moveCarTo(el) {
    car.restingBlock = el;
    car.style.top = el.offsetTop + 'px';
    car.style.left = el.offsetLeft + 'px';
}

function plotPath() {
    var prevBlock;
    // var seedRandom = new Math.seedrandom('1315b022-3715-4e54-aa31-e917c53fb0be');
    var seedRandom = new Math.seedrandom();

    do {
        var newBlock;

        if (track.length > 0) {
            newBlock = prevBlock.branches[Math.floor(seedRandom() * prevBlock.branches.length)];
            newBlock.branches = newBlock.branches.filter(neighbour => !track.includes(neighbour));
        }
        else {
            newBlock = trackBlocks[Math.floor(seedRandom() * nRow)][0];
        }
        
        newBlock.style.backgroundColor = 'lightblue';
        
        if (prevBlock) prevBlock.nextBlock = newBlock;

        prevBlock = newBlock;
        track.push(newBlock);
    }
    while (prevBlock.endOfRow == false);
}

function drawGrid() {
    //  create an array or undefined items whose length is equal to nRow
    var rows = new Array(nRow).fill();

    grid.style.width = nColumn * blockSize + 'px';
    grid.style.height = nRow * blockSize + 'px';
    content.style.width = grid.style.width;

    //  build the trackBlocks 2D array
    rows.forEach((row, rowIndex) => {
        //  create an array of undefined items whose length is equal to nColumn
        row = new Array(nColumn).fill();
        trackBlocks.push(row);

        row.forEach((block, blockIndex) => {
            block = document.createElement('div');
            block.style.top = rowIndex * blockSize + 'px';
            block.style.left = blockIndex * blockSize + 'px';
            block.endOfRow = blockIndex == nColumn - 1;            
            row[blockIndex] = block;
            grid.appendChild(block);
        });
    });

    //  store neighbouring blocks for each block
    trackBlocks.forEach((row, nthRow) => {
        row.forEach((block, nthColumn) => {
            block.up = block.down = block.right = null;
            block.branches = [];

            if (nthRow > 0) {
                block.up = trackBlocks[nthRow - 1][nthColumn];
                block.branches.push(block.up);
            }
            if (nthRow < nRow - 1) {
                block.down = trackBlocks[nthRow + 1][nthColumn];
                block.branches.push(block.down);
            }
            if (nthColumn < nColumn - 1) {
                block.right = trackBlocks[nthRow][nthColumn + 1];
                block.branches.push(block.right);
            }
        });
    });
}

function resizeContent() {
    var contentRatio = content.offsetWidth / content.offsetHeight;
    var windowRatio = window.innerWidth / window.innerHeight;

    content.style.left = `${(window.innerWidth - content.offsetWidth) / 2}px`;
    content.style.top = `${(window.innerHeight - content.offsetHeight) / 2}px`;
    content.style.transform = `scale(${contentRatio > windowRatio ? window.innerWidth / content.offsetWidth : window.innerHeight / content.offsetHeight})`;
}