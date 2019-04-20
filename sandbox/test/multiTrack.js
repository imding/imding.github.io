var content = document.querySelector('#content');
var grid = document.querySelector('#grid');
var car = document.querySelector('#car');
var btnRun = document.querySelector('#btnRun');
var btnStop = document.querySelector('#btnStop');
var btnShow = document.querySelector('#btnShow');
var messages = document.querySelector('#messages');
var userInput = document.querySelector('#userInput');
var cellSize = 32;
var nColumn = 6;
var nRow = 6;
var gridCells = [];
var bestAttempt = [];
var shortMemory = [];
var mode = 'fast';
var deadends = 0.3;

//  for the showBestAttempt function only
var demoCounter = 0;

//  for the runWithoutUI function only
var iteration = 0;
var totalIteration = 0;
var currentCell;
var prevCell;

window.onload = init;
window.onresize = resizeContent;


function init() {
    drawGrid();
    
    //  set starting conditions for the car
    car.className = mode;
    car.rotation = 0;
    car.currentRow = randomItemFrom(gridCells);
    car.startCell = car.currentRow[0];
    car.transition = car.style.transition;
    
    moveCarTo(car.startCell);

    plotPath();

    btnRun.onclick = () => {
        if (demoCounter > 0) {
            car.removeEventListener('transitionend', showBestAttempt);
            demoCounter = 0;
        }

        btnRun.textContent = 'Running...';
        btnRun.disabled = true;
        btnShow.disabled = true;

        if (mode == 'ultra') {
            runWithoutUI();
        }
        else {
            //  handle the transitionend event using the nextCommand function
            car.addEventListener('transitionend', findNextCell);
    
            btnStop.disabled = false;
    
            findNextCell();
        }
    };

    btnShow.onclick = () => {
        btnRun.disabled = true;
        btnShow.disabled = true;
        car.className = 'normal';

        if (mode != 'ultra') {
            car.removeEventListener('transitionend', findNextCell);
        }

        car.addEventListener('transitionend', showBestAttempt);
        showBestAttempt();
    };

    if (mode != 'ultra') {
        btnStop.onclick = () => {
            btnRun.textContent = 'Run Algorithm';
            btnRun.disabled = false;
            btnStop.disabled = true;
            stopAlgorithm('User stopped algorithm.', false);

            if (bestAttempt.length > 0) {
                btnShow.disabled = false;
            }
        };
    }

    resizeContent();
}

function showBestAttempt() {
    if (event && event.propertyName == 'transform') return;

    if (demoCounter < bestAttempt.length) {
        moveCarTo(bestAttempt[demoCounter++]);
    }
    else {
        setTimeout(() => {
            btnShow.disabled = false;
            btnRun.disabled = false;
            
            car.removeEventListener('transitionend', showBestAttempt);
            
            if (mode == 'ultra') {
                car.rotation = 0;
                car.prevCell = null;
                car.currentCell = null;
                car.classList.remove('normal');
                moveCarTo(gridCells[car.startCell.row][car.startCell.column]);
            }
            else {
                car.addEventListener('transitionend', findNextCell);
                reset();
            }

            demoCounter = 0;
        }, 2000);
    }
}

function findNextCell() {
    if (event && event.propertyName == 'transform') return;
    if (car.currentCell.id == 'finish') return;

    var currentCell = car.currentCell;
    
    //  check if the car has circled back to the starting cell
    if (shortMemory.length > 0 && currentCell == car.startCell && currentCell.roadType.length == 2) {
        stopAlgorithm(`The algorithm failed to find the exit in this iteration. Distance travelled: ${shortMemory.length} cells.`);
    }
    else if (currentCell.deadend) {
        stopAlgorithm('The algorithm lead to a dead end.');
    }
    else {
        var randomNextCell;

        do randomNextCell = currentCell[randomItemFrom(currentCell.roadType)];
        while (!randomNextCell || randomNextCell == car.prevCell);

        shortMemory.push(randomNextCell);
    
        //  check if the car has travelled same distance as the best attempt
        if (shortMemory.length == bestAttempt.length) {
            stopAlgorithm(`The algorithm failed to find the exit in less than ${bestAttempt.length} moves, this iteration is discarded.`);
        }
        else {
            moveCarTo(randomNextCell);
        
            //  check if the car has reached the exit
            if (randomNextCell.id == 'finish') {
                bestAttempt = shortMemory;
                stopAlgorithm(`Your algorithm worked! Total distance travelled: ${bestAttempt.length} cells.`);
            }
            else if (mode == 'fast' && btnRun.disabled) {
                setTimeout(findNextCell, 0);
            }
        }
    }
}

function runWithoutUI() {
    btnRun.disabled = true;
    btnRun.textContent = 'Running...';

    var cellsData;
    var uuidv4 = () => {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
            let r = Math.random() * 16 | 0,
                v = c == 'x' ? r : (r & 0x3 | 0x8);

            return v.toString(16);
        });
    };
    var stopPureSim = message => {
        shortMemory = [];
        currentCell = car.startCell;
        prevCell = car.startCell;
        iteration++;
        shortMemory = [];
        
        if (message) console.log(message);
    };
    
    cellsData = gridCells.map(row => row.map(cell => {
        return {
            id: uuidv4(),
            roadType: cell.roadType,
            start: cell == car.startCell,
            finish: cell.id == 'finish',
            deadend: !!cell.deadend,
        };
    }));

    cellsData.forEach((row, nthRow) => row.forEach((cell, nthColumn) => {
        cell.row = nthRow;
        cell.column = nthColumn;
        cell.up    = nthRow > 0              ? cellsData[nthRow - 1][nthColumn] : null;
        cell.down  = nthRow < nRow - 1       ? cellsData[nthRow + 1][nthColumn] : null;
        cell.left  = nthColumn > 0           ? cellsData[nthRow][nthColumn - 1] : null;
        cell.right = nthColumn < nColumn - 1 ? cellsData[nthRow][nthColumn + 1] : null;

        if (cell.start) {
            car.startCell = cell;
            currentCell = cell;
            prevCell = cell;
        }
    }));

    iteration = 0;

    var pathFound = 0;

    console.clear();

    do {
        if (currentCell.id == car.startCell.id && currentCell.roadType.length == 2 && shortMemory.length > 0) {
            stopPureSim();
        }
        else if (currentCell.deadend) {
            stopPureSim();
        }
        else if (currentCell.finish) {
            bestAttempt = shortMemory;
            stopPureSim('The algorithm found a new path to the exit!');
            pathFound = true;
        }
        else {
            var randomNextCell;

            do randomNextCell = currentCell[randomItemFrom(currentCell.roadType)];
            while (!randomNextCell || randomNextCell.id == prevCell.id);
            
            prevCell = currentCell;
            currentCell = randomNextCell;
            shortMemory.push(gridCells[currentCell.row][currentCell.column]);

            if (bestAttempt.length > 0 && shortMemory.length > bestAttempt.length) {
                stopPureSim();
            }
        }
    }
    while (pathFound == false && iteration < 100000000);

    totalIteration += iteration;

    if (pathFound) {
        btnShow.disabled = false;
    }

    btnRun.disabled = false;
    btnRun.textContent = 'Run Algorithm';

    var totalIterationText = totalIteration;

    if ((totalIteration / 1000000) >= 1) {
        totalIterationText = `${(totalIteration / 1000000).toFixed(1)} million`;
    }
    else if ((totalIteration / 1000) >= 1) {
        totalIterationText = `${(totalIteration / 1000).toFixed(1)} thousand`;
    }

    if (bestAttempt.length > 0) {
        console.log(`Algorithm ran ${totalIterationText} times, best attempt: ${bestAttempt.length} steps.`);
    }
    else {
        console.log(`Algorithm ran ${totalIterationText} times but did not find a path to the exit.`);
    }
}

function stopAlgorithm(message, restart = true) {
    if (restart == true) {
        var countdown = duration => {
            if (btnStop.disabled) return;

            if (duration > 0) {
                btnRun.disabled = true;
                return setTimeout(() => countdown(--duration), 1000);
            }
    
            findNextCell();
        };
    
        setTimeout(() => {
            reset();
            countdown(1);
        }, 500);
    }
    else {
        reset();
    }

    if (message) console.log(message);
}

function reset() {
    shortMemory = [];
    car.style.transition = 'none';
    car.rotation = 0;
    car.prevCell = null;
    car.currentCell = null;
    moveCarTo(car.startCell);

    setTimeout(() => {
        car.style.transition = '';
        car.className = mode;
    }, 100);
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
                (prevCell == cellRight && nextCell == cellUp)   ||
                (prevCell == cellLeft && nextCell == cellDown)  ||
                (prevCell == cellUp && nextCell == cellLeft)    ||
                (prevCell == cellDown && nextCell == cellRight);
            
            anitClockwise =
                (prevCell == cellRight && nextCell == cellDown) ||
                (prevCell == cellLeft && nextCell == cellUp)    ||
                (prevCell == cellUp && nextCell == cellRight)   ||
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

    var removeDeadEnd = roadCell => {
        if (roadCell.roadType.length > 1) {
            delete roadCell.deadend;
        }
    };
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
        removeDeadEnd(prevRoadCell);

        if (targetCell.className == 'road' || targetCell.deadend) {
            targetCell.setRoadType(targetCell.roadType.sort().join(''));
            removeDeadEnd(targetCell);
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

    //  create branches to fill all the empty cells
    var branch = [];
    var emptyCells = gridCells.flat().filter(cell => cell.className == '' && cell.right != null);

    while (emptyCells.length > 0) {
        //  check if a branch is already created
        if (branch.length == 0) {
            //  select a cell from the first path
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
            remove(prevRoadCell).from(emptyCells);

            //  determine whether new road cell is a deadend
            if (newRoadCell.className != 'road' && Math.random() > deadends) {
                newRoadCell.deadend = true;
                remove(newRoadCell).from(emptyCells);
            }
        }

        //  remove paths that lead to the last column
        if (newRoadCell.right.right == null) {
            remove(newRoadCell.right).from(newRoadCell.paths);
        }

        expandFrom(newRoadCell);

        if (newRoadCell.className == 'road' || newRoadCell.deadend) {
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

    // messages.style.height = `${grid.offsetHeight - userInput.offsetHeight}px`;

    // content.style.width = `${grid.offsetWidth + messages.offsetWidth}px`;
    content.style.width = grid.style.width;

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
            // cell.path = cellDir => {
            //     return {
            //         linksTo: targetCell => {
            //             return {
            //                 path: targetCellDir => {
            //                     return cell.roadType.includes(cellDir) && targetCell.roadType.includes(targetCellDir);
            //                 },
            //             };
            //         },
            //     };
            // };
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