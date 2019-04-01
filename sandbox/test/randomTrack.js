var content = document.querySelector('#content');
var grid = document.querySelector('#grid');
var car = document.querySelector('#car');
var btnRun = document.querySelector('#btnRun');
var cellSize = 32;
var nColumn = 20;
var nRow = 10;
var trackCells = [];
var LongMemrory = [];
var workingMemory = [];

window.onload = init;
window.onresize = resizeContent;
btnRun.onclick = findNextCell;

function init() {
    drawGrid();
    plotPath();

    //  handle the transitionend event using the nextCommand function
    car.addEventListener('transitionend', findNextCell);

    resizeContent();
}

function autoPilot() {
    btnRun.disabled = true;
    btnRun.textContent = 'Ready...';

    setTimeout(() => {
        btnRun.textContent = '';
    }, 1000);
}

function findNextCell() {
    var cellUp = car.currentCell.up;

    if (cellUp && cellUp != car.prevCell && cellUp.isConnectedTo(car.currentCell)) {
        // check through long memory
        //   if cellUp is in longMemory && the residing entry is a success, then go ahead
        moveCarTo(cellUp);
        workingMemory.push(cellUp);
    }
    else {
        var cellDown = car.currentCell.down;

        if (cellDown && cellDown != car.prevCell && cellDown.isConnectedTo(car.currentCell)) {
            moveCarTo(cellDown);
            workingMemory.push(cellDown);
        }
        else {
            var cellRight = car.currentCell.right;

            if (cellRight && cellRight != car.prevCell && cellRight.isConnectedTo(car.currentCell)) {
                moveCarTo(cellRight);
                workingMemory.push(right);
            }
            else {
                checkResult();
            }
        }
    }
}

function checkResult() {
    if ('reached_end') {
        LongMemrory.push(workingMemory, 'success');
        workingMemory = [];
    }
    else {
        LongMemrory.push(workingMemory, 'failure');
    }
}

function readUserCommand(cmd) {
    if (cmd == "stop") {
        moveCarTo(car);
        dashboard('car stopped.');
    }
    else if (cmd == "continue" || cmd == 'keep going' || cmd == 'resume') {
        findNextCell();
    }
    else if (cmd == 'where am i') {
        dashboard('We are in D4');
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
    car.prevCell = car.currentCell;
    car.currentCell = el;
    car.style.top = el.offsetTop + 'px';
    car.style.left = el.offsetLeft + 'px';
}

function plotPath() {
    var randomRowIndex = Math.floor(Math.random() * trackCells.length);
    var prevCell = trackCells[randomRowIndex][0];

    prevCell.style.backgroundColor = 'lightblue';
    prevCell.inDir = 'left';

    moveCarTo(prevCell);

    do {
        var randomBranchIndex = Math.floor(Math.random() * prevCell.paths.length);
        var nextCell;

        nextCell = prevCell.paths[randomBranchIndex];
        nextCell.style.backgroundColor = 'lightblue';
        nextCell.paths = nextCell.paths.filter(cell => cell != prevCell);
        
        if (nextCell.offsetTop > prevCell.offsetTop) {
            prevCell.outDir = 'down';
            nextCell.inDir = 'up';
        }
        else if (nextCell.offsetTop < prevCell.offsetTop) {
            prevCell.outDir = 'up';
            nextCell.inDir = 'down';
        }
        else {
            prevCell.outDir = 'right';
            nextCell.inDir = 'left';
        }
        
        prevCell = nextCell;
    }
    while (nextCell.endOfRow == false);
}

function drawGrid() {
    //  create an array or undefined items whose length is equal to nRow
    var rows = new Array(nRow).fill();

    grid.style.width = nColumn * cellSize + 'px';
    grid.style.height = nRow * cellSize + 'px';
    content.style.width = grid.style.width;

    //  build the trackCells 2D array
    rows.forEach((row, rowIndex) => {
        //  create an array of undefined items whose length is equal to nColumn
        row = new Array(nColumn).fill();
        trackCells.push(row);

        row.forEach((cell, cellIndex) => {
            cell = document.createElement('div');
            cell.style.top = rowIndex * cellSize + 'px';
            cell.style.left = cellIndex * cellSize + 'px';
            cell.endOfRow = cellIndex == nColumn - 1;      
            row[cellIndex] = cell;
            grid.appendChild(cell);
        });
    });

    //  store neighbouring cells for each cell
    trackCells.forEach((row, nthRow) => {
        row.forEach((cell, nthColumn) => {
            cell.up = cell.down = cell.right = null;
            cell.paths = [];

            if (nthRow > 0) {
                cell.up = trackCells[nthRow - 1][nthColumn];
                cell.paths.push(cell.up);
            }
            if (nthRow < nRow - 1) {
                cell.down = trackCells[nthRow + 1][nthColumn];
                cell.paths.push(cell.down);
            }
            if (nthColumn < nColumn - 1) {
                cell.right = trackCells[nthRow][nthColumn + 1];
                cell.paths.push(cell.right);
            }

            cell.isConnectedTo = block => {
                var pathUp = block.outDir == 'up' && cell.inDir == 'down';
                var pathDown = block.outDir == 'down' && cell.inDir == 'up';
                var pathRight = block.outDir == 'right' && cell.inDir == 'left';

                return pathUp || pathDown || pathRight;
            };
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