var content = document.querySelector('#content');
var grid = document.querySelector('#grid');
var car = document.querySelector('#car');
var btnRun = document.querySelector('#btnRun');
var messages = document.querySelector('#messages');
var userInput = document.querySelector('#userInput');
var cellSize = 32;
var nColumn = 10;
var nRow = 5;
var gridCells = [];

var debugMode = true;

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

function findNextCell() {
    if (event.propertyName == 'transform') return;

    var cellUp = car.currentCell.up;

    if (cellUp && cellUp != car.prevCell && cellUp.isConnectedTo(car.currentCell)) {
        moveCarTo(cellUp);
    }
    else {
        var cellDown = car.currentCell.down;

        if (cellDown && cellDown != car.prevCell && cellDown.isConnectedTo(car.currentCell)) {
            moveCarTo(cellDown);
        }
        else {
            var cellRight = car.currentCell.right;

            if (cellRight && cellRight != car.prevCell && cellRight.isConnectedTo(car.currentCell)) {
                moveCarTo(cellRight);
            }
            else {
                checkResult();
            }
        }
    }
}

function checkCell(cell) {
    
    cell.color = cell.style.backgroundColor;
    cell.style.backgroundColor = 'lightgreen';

    if (cell && cell != car.prevCell && cell.isConnectedTo(car.currentCell)) {
        if (debugMode) {
            // setTimeout(cell => set);
        }
        else {
            moveCarTo(cell);
        }
    }
}

function checkResult() {
    var carPositionIndex = car.currentRow.indexOf(car.currentCell);
    
    if (carPositionIndex == car.currentRow.length - 1) {
        console.log('The auto-pilot system worked!');
    }
    else {
        console.log('Your auto-pilot system malfunctioned.');
    }
}

function moveCarTo(nextCell) {
    //  rotate the car
    if (car.currentCell) {
        var rotation = 0;
        
        if (car.currentCell.up == nextCell) {
            rotation = -90;
        }
        else if (car.currentCell.down == nextCell) {
            rotation = 90;
        }

        car.style.transform = `scale(0.6) rotate(${rotation}deg)`;
    }

    car.prevCell = car.currentCell;
    car.currentCell = nextCell;
    car.currentRow = gridCells.filter(row => row.includes(nextCell))[0];
    car.style.top = nextCell.offsetTop + 'px';
    car.style.left = nextCell.offsetLeft + 'px';
    
    
}

function plotPath() {
    var randomRowIndex = Math.floor(Math.random() * gridCells.length);

    car.currentRow = gridCells[randomRowIndex];

    var prevCell = car.currentRow[0];
    var nextCell;

    prevCell.inDir = ['left'];

    moveCarTo(prevCell);

    do {
        var randomBranchIndex = Math.floor(Math.random() * prevCell.paths.length);

        nextCell = prevCell.paths[randomBranchIndex];
        nextCell.paths = nextCell.paths.filter(cell => cell != prevCell);
        
        if (nextCell.offsetTop > prevCell.offsetTop) {
            nextCell.inDir = ['up'];
            prevCell.outDir = ['down'];
        }
        else if (nextCell.offsetTop < prevCell.offsetTop) {
            nextCell.inDir = ['down'];
            prevCell.outDir = ['up'];
        }
        else {
            nextCell.inDir = ['left'];
            prevCell.outDir = ['right'];
        }

        //  assign appropriate road type image
        var roadType;
        var dir = [prevCell.inDir.sort().join(''), prevCell.outDir.sort().join('')].sort().join('');

        if (dir == 'downup') {
            roadType = 'vertical';
        }
        else if (dir == 'leftright') {
            roadType = 'horizontal';
        }
        else if (dir == 'downright') {
            roadType = 'upper_left_corner';
        }
        else if (dir == 'downleft') {
            roadType = 'upper_right_corner';
        }
        else if (dir == 'leftup') {
            roadType = 'lower_right_corner';
        }
        else if (dir == 'rightup') {
            roadType = 'lower_left_corner';
        }

        prevCell.setRoadType(roadType);

        if (nextCell.endOfRow) {
            nextCell.setRoadType('finish');
        }

        //  update prevCell for next loop iteration
        prevCell = nextCell;
    }
    while (nextCell.endOfRow == false);


}

function drawGrid() {
    //  create an array or undefined items whose length is equal to nRow
    var rows = new Array(nRow).fill();

    grid.style.width = nColumn * cellSize + 'px';
    grid.style.height = nRow * cellSize + 'px';

    messages.style.height = `${grid.offsetHeight - userInput.offsetHeight}px`;

    content.style.width = `${grid.offsetWidth + messages.offsetWidth}px`;

    //  build the trackCells 2D array
    rows.forEach((row, rowIndex) => {
        //  create an array of undefined items whose length is equal to nColumn
        row = new Array(nColumn).fill();
        gridCells.push(row);

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
    gridCells.forEach((row, nthRow) => {
        row.forEach((cell, nthColumn) => {
            cell.up = cell.down = cell.right = null;
            cell.paths = [];
            cell.inDir = cell.outDir = [];
            cell.isConnectedTo = prevCell => {
                var pathUp = prevCell.outDir.includes('up') && cell.inDir.includes('down');
                var pathDown = prevCell.outDir.includes('down') && cell.inDir.includes('up');
                var pathRight = prevCell.outDir.includes('right') && cell.inDir.includes('left');

                return pathUp || pathDown || pathRight;
            };
            cell.setRoadType = type => {
                cell.className = 'road';
                cell.style.backgroundImage = `url('https://app.bsd.education/resources/road_${type}.png')`;
            };

            if (nthRow > 0) {
                cell.up = gridCells[nthRow - 1][nthColumn];
                cell.paths.push(cell.up);
            }
            if (nthRow < nRow - 1) {
                cell.down = gridCells[nthRow + 1][nthColumn];
                cell.paths.push(cell.down);
            }
            if (nthColumn < nColumn - 1) {
                cell.right = gridCells[nthRow][nthColumn + 1];
                cell.paths.push(cell.right);
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