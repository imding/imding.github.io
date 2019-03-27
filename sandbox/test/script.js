var content = document.querySelector('#content');
var track = document.querySelector('#track');
var blockSize = 32;
var nColumn = 10;
var nRow = 5;
var trackBlocks = [];
var path = [];

window.onload = init;
window.onresize = resizeContent;


function init() {
    drawGrid();
    plotPath();

    resizeContent();
}

function plotPath() {
    var prevBlock;
    // var seedRandom = new Math.seedrandom('1315b022-3715-4e54-aa31-e917c53fb0be');
    var seedRandom = new Math.seedrandom();

    do {
        var newBlock;

        if (path.length > 0) {
            newBlock = prevBlock.neighbours[Math.floor(seedRandom() * prevBlock.neighbours.length)];
            newBlock.neighbours = newBlock.neighbours.filter(neighbour => !path.includes(neighbour));
        }
        else {
            newBlock = trackBlocks[Math.floor(seedRandom() * nRow)][0];
        }
        
        newBlock.style.backgroundColor = 'lightblue';
        path.push(newBlock);
        prevBlock = newBlock;
    }
    while (prevBlock.endOfRow == false);
}

function drawGrid() {
    //  create an array or undefined items whose length is equal to nRow
    var rows = new Array(nRow).fill();

    track.style.width = nColumn * blockSize + 'px';
    track.style.height = nRow * blockSize + 'px';
    content.style.width = track.style.width;

    //  build the trackBlocks 2D array
    rows.forEach((row, rowIndex) => {
        //  create an array or undefined items whose length is equal to nColumn
        row = new Array(nColumn).fill();
        trackBlocks.push(row);

        row.forEach((block, blockIndex) => {
            block = document.createElement('div');
            block.style.top = rowIndex * blockSize + 'px';
            block.style.left = blockIndex * blockSize + 'px';
            block.endOfRow = blockIndex == nColumn - 1;
            
            row[blockIndex] = block;
            track.appendChild(block);
        });
    });

    //  store neighbouring blocks for each block
    trackBlocks.forEach((row, nthRow) => {
        row.forEach((block, nthColumn) => {
            block.neighbours = [];

            if (nthRow > 0) {
                block.neighbours.push(trackBlocks[nthRow - 1][nthColumn]);
            }
            if (nthRow < nRow - 1) {
                block.neighbours.push(trackBlocks[nthRow + 1][nthColumn]);
            }
            if (nthColumn < nColumn - 1) {
                block.neighbours.push(trackBlocks[nthRow][nthColumn + 1]);
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