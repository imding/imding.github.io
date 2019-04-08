var content = document.querySelector('#content');
var grid = document.querySelector('#grid');
var car = document.querySelector('#car');
var btnRun = document.querySelector('#btnRun');
var btnAddPath = document.querySelector('#btnAddPath');
var messages = document.querySelector('#messages');
var userInput = document.querySelector('#userInput');
var cellSize = 32;
var nColumn = 10;
var nRow = 10;
var gridCells = [];
var bestAttempt = [];
var shortMemory = [];
var mode = 'fast';

window.onload = init;
window.onresize = resizeContent;
btnRun.onclick = findNextCell;

function init() {
    drawGrid();
    
    //  set starting conditions for the car
    car.className = mode;
    car.rotation = 0;
    car.currentRow = randomItemFrom(gridCells);
    car.startCell = car.currentRow[0];
    moveCarTo(car.startCell);

    plotPath();

    //  handle the transitionend event using the nextCommand function
    car.addEventListener('transitionend', findNextCell);

    resizeContent();
}

function stopAlgorithm() {
    setTimeout(() => {
        shortMemory = [];

        // btnRun.disabled = false;
        // btnRun.textContent = 'Reset Car';
        // btnRun.onclick = resetCar;
        resetCar();
    }, 500);
}

function findNextCell() {
    if (event && event.propertyName == 'transform') return;
    if (car.currentCell.id == 'finish') return;

    btnRun.disabled = true;
    btnRun.textContent = 'Running...';

    var randomNextCell;
    var currentCell = car.currentCell;
    
    //  check if the car has circled back to the starting cell
    if (shortMemory.length > 0 && currentCell == car.startCell && currentCell.roadType.length == 2) {
        console.log(`The algorithm failed to find the exit in this iteration. Distance travelled: ${shortMemory.length} cells.`);
        return stopAlgorithm();
    }

    while (randomNextCell == undefined || randomNextCell == car.prevCell) {        
        randomNextCell = currentCell[randomItemFrom(currentCell.roadType)];
    }
    
    shortMemory.push(randomNextCell);
    
    //  check if the car has reached the exit
    if (randomNextCell.id == 'finish') {
        console.log(`Your algorithm worked! Total distance travelled: ${shortMemory.length} cells.`);
        bestAttempt = shortMemory;
        stopAlgorithm();
    }
    
    //  check if the car has travelled same distance as the best attempt
    else if (shortMemory.length == bestAttempt.length) {
        console.log(`The algorithm failed to find the exit in less than ${bestAttempt.length} moves, this iteration is discarded.`);
        return stopAlgorithm();
    }

    moveCarTo(randomNextCell);
}

function resetCar() {    
    var countdown = duration => {
        if (duration > 0) {
            btnRun.disabled = true;
            btnRun.textContent = `Restarting in ${duration}`;
            return setTimeout(() => countdown(--duration), 1000);
        }

        car.style.transition = transition;
        // btnRun.disabled = false;
        // btnRun.textContent = 'Run Again';
        // btnRun.onclick = findNextCell;
        findNextCell();
    };
    var transition = car.style.transition;
    
    car.style.transition = 'none';
    car.rotation = 0;
    car.prevCell = null;
    car.currentCell = null;
    
    moveCarTo(car.startCell);
    countdown(1);
}

function moveCarTo(nextCell) {
    //  rotate the car
    var currentCell = car.currentCell;
    var prevCell = car.prevCell;

    if (currentCell) {
        var clockwise;
        var anitClockwise;
        var cellUp = currentCell.up;
        var cellDown = currentCell.down;
        var cellRight = currentCell.right;
        var cellLeft = currentCell.left;
        
        if (prevCell) {
            clockwise =
                (prevCell == cellRight && nextCell == cellUp) ||
                (prevCell == cellLeft && nextCell == cellDown) ||
                (prevCell == cellUp && nextCell == cellLeft) ||
                (prevCell == cellDown && nextCell == cellRight);
            
            anitClockwise =
                (prevCell == cellRight && nextCell == cellDown) ||
                (prevCell == cellLeft && nextCell == cellUp) ||
                (prevCell == cellUp && nextCell == cellRight) ||
                (prevCell == cellDown && nextCell == cellLeft);
        }
        else {
            clockwise = nextCell == cellDown;
            anitClockwise = nextCell == cellUp;
        }

        if (clockwise) {
            car.rotation += 90;
        }
        else if (anitClockwise) {
            car.rotation -= 90;
        }
    }
    
    car.prevCell = car.currentCell;
    car.currentCell = nextCell;
    car.currentRow = gridCells.filter(row => row.includes(nextCell))[0];
    car.style.top = nextCell.offsetTop + 'px';
    car.style.left = nextCell.offsetLeft + 'px';
    car.style.transform = `rotate(${car.rotation}deg)`;
}

function plotPath(prevRoadCell) {
    var newRoadCell;

    prevRoadCell = prevRoadCell || car.currentCell;
    prevRoadCell.roadType.push('left');

    var expandFrom = targetCell => {
        //  remove target cell from the available paths of the previous road cell
        remove(targetCell).from(prevRoadCell.paths);
        //  remove the previous road cell from the available paths of target cell
        remove(prevRoadCell).from(targetCell.paths);

        //  assign road type for previous and target cells
        if (targetCell.up == prevRoadCell) {
            prevRoadCell.roadType.push('down');
            targetCell.roadType.push('up');
        }
        else if (targetCell.down == prevRoadCell) {
            prevRoadCell.roadType.push('up');
            targetCell.roadType.push('down');
        }
        else if (targetCell.left == prevRoadCell) {
            prevRoadCell.roadType.push('right');
            targetCell.roadType.push('left');
        }
        else {
            prevRoadCell.roadType.push('left');
            targetCell.roadType.push('right');
        }

        //  assign appropriate road type image
        prevRoadCell.setRoadType(prevRoadCell.roadType.sort().join(''));

        if (targetCell.className == 'road') {
            targetCell.setRoadType(targetCell.roadType.sort().join(''));
        }

        prevRoadCell = targetCell;
    };
    
    //  expand from the previous road cell until end of row is reached
    do {
        newRoadCell = randomItemFrom(prevRoadCell.paths.filter(cell => cell != prevRoadCell.left));
        expandFrom(newRoadCell);
        
        newRoadCell.paths.forEach(neighbourCell => {
            //  check whether target cell blocks off paths of neighbouring cells
            if (neighbourCell.className == 'road') {
                remove(newRoadCell).from(neighbourCell.paths);
                remove(neighbourCell).from(newRoadCell.paths);
            }
        });
    }
    while (newRoadCell.endOfRow == false);

    //  set road type on the last cell in a row
    newRoadCell.setRoadType('finish');
    newRoadCell.id = 'finish';

    var branch = [];
    var emptyCells = gridCells.flat().filter(cell => cell.className == '' && cell.right != null);

    while (emptyCells.length > 0) {
        if (branch.length == 0) {
            var branchCell = randomItemFrom(gridCells.flat().filter(cell =>
                cell.className == 'road' &&
                cell.id != 'finish' &&
                cell.right != null &&
                cell.right.right != null &&
                cell.right.id != 'finish' &&
                cell.paths.filter(neighbourCell => neighbourCell.className == '').length > 0
            ));

            prevRoadCell = branchCell;
            newRoadCell = randomItemFrom(branchCell.paths.filter(cell => cell.className == ''));
        }
        else {
            newRoadCell = randomItemFrom(branch[branch.length - 1].paths);
            emptyCells.pop();
        }

        //  remove paths that lead to the last column
        if (newRoadCell.right.right == null) {
            remove(newRoadCell.right).from(newRoadCell.paths);
        }

        expandFrom(newRoadCell);

        if (newRoadCell.className == 'road') {
            branch = [];
        }
        else {
            branch.push(newRoadCell);
        }
    }
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
            cell.up = null;
            cell.down = null;
            cell.left = null;
            cell.right = null;
            cell.paths = [];
            cell.roadType = [];
            cell.path = cellDir => {
                return {
                    linksTo: targetCell => {
                        return {
                            path: targetCellDir => {
                                return cell.roadType.includes(cellDir) && targetCell.roadType.includes(targetCellDir);
                            },
                        };
                    },
                };
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
            if (nthColumn > 0) {
                cell.left = gridCells[nthRow][nthColumn - 1];
                cell.paths.push(cell.left);
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

function randomIndexFrom(arr) {
    return Math.floor(Math.random() * arr.length);
}

function randomItemFrom(arr) {
    return arr[randomIndexFrom(arr)];
}

function remove(item) {
    return {
        from: arr => arr.splice(arr.indexOf(item), 1),
    };
}