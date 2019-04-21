var content = document.querySelector('#content');
var title = document.querySelector('#title');
var grid = document.querySelector('#grid');
var car = document.querySelector('#car');

var chatbot = document.querySelector('#chatbot');
var messages = document.querySelector('#messages');
var userInput = document.querySelector('#userInput');
var btnSend = document.querySelector('#btnSend');

var nColumn = 6;
var nRow = 4;
var deadends = 0.3;
var cellSize = 90 / nColumn;
var gridCells = [];
var autoMode = false;
var imagePath = 'https://app.bsd.education/resources';

window.onload = init;
window.onresize = resizeContent;
window.onkeypress = handleKeyPress;

btnSend.onclick = readUserInput;

btnSend.enable = () => {
    btnSend.disabled = false;
    btnSend.style.filter = 'inherit';
    btnSend.style.opacity = 'inherit';
};

btnSend.disable = () => {
    btnSend.disabled = true;
    btnSend.style.filter = 'grayscale(0.6)';
    btnSend.style.opacity = '0.6';
};

function init() {
    drawGrid();
    plotPath();

    car.rotation = 0;
    car.style.width = `${cellSize}vw`;
    car.style.height = car.style.width;
    
    //  place the car on the first block in the track
    car.rotation = 0;
    
    //  handle the transitionend event using the checkPrevMove function
    car.addEventListener('transitionend', checkPrevMove);

    resizeContent();

    userInput.focus();
}

function readUserInput() {
    var command = userInput.value.trim().replace(/\s+/g, ' ').toLowerCase();
    
    if (command.length > 0) {
        displayUserMessage(command);

        btnSend.disable();

        if (command == 'help') {
            btnSend.enable();
            displayBotMessage('Sure, here is a list of commands I can understand:');
            displayBotMessage('"go up" - move the car up one cell.');
            displayBotMessage('"go down" - move the car down one cell.');
            displayBotMessage('"go left" - move the car to the left one cell.');
            displayBotMessage('"go right" - move the car to the right one cell.');
        }
        else if (command == 'reset') {
            reset();
            btnSend.enable();
        }
        else if (command == 'go up') {
            goUp();
        }
        else if (command == 'go down') {
            goDown();
        }
        else if (command == 'go left') {
            goLeft();
        }
        else if (command == 'go right') {
            goRight();
        }
        else if (command == 'auto drive') {
            autoMode = true;
            decideNextMove();
        }
        else {
            btnSend.enable();
            displayBotMessage(`Sorry, I didn't understand your command: ${command}`);
        }
    }
    
    userInput.focus();
}

function reset() {
    car.style.transition = 'none';
    car.rotation = 0;
    car.prevCell = null;
    car.currentCell = null;
    moveCarTo(car.startCell);
    setTimeout(() => car.style.transition = '', 100);
}

function goUp() {
    checkAndMove('up');
}

function goDown() {
    checkAndMove('down');
}

function goRight() {
    checkAndMove('right');
}

function goLeft() {
    checkAndMove('left');
}

function checkAndMove(dir) {
    if (car.currentCell[dir] == 'unknown') {
        displayBotMessage('The car cannot leave the map.');
        btnSend.enable();
    }
    else {
        moveCarTo(car.currentCell[dir]);
    }
}

function decideNextMove() {
    var currentCell = car.currentCell;
    var prevCell = car.prevCell;
    var availableMoves = [];
    
    if (currentCell.right != prevCell && currentCell.reachableRoads.includes(currentCell.right)) {
        availableMoves.push(currentCell.right);
    }
    if (currentCell.up != prevCell && currentCell.reachableRoads.includes(currentCell.up)) {
        availableMoves.push(currentCell.up);
    }
    if (currentCell.down != prevCell && currentCell.reachableRoads.includes(currentCell.down)) {
        availableMoves.push(currentCell.down);
    }
    if (currentCell.left != prevCell && currentCell.reachableRoads.includes(currentCell.left)) {
        availableMoves.push(currentCell.left);
    }

    if (availableMoves.length > 0) {
        moveCarTo(randomItemFrom(availableMoves));
    }
    else {
        btnSend.enable();
        autoMode = false;

        if (currentCell.id == 'finish') {
            displayBotMessage('Your AutoDrive system worked, the car has reached the finish line!');
        }
        else {
            displayBotMessage('The AutoDrive system failed to determine where to go next.');
        }
    }
}

function checkPrevMove() {
    if (event && event.propertyName == 'transform') return;
    
    if (autoMode == true) {
        decideNextMove();
    }
    else {
        btnSend.enable();

        var currentCell = car.currentCell;
        var prevCell = car.prevCell;

        //  make sure the path to the current cell is valid
        if (prevCell.reachableRoads.includes(currentCell)) {
            if (currentCell.id == 'finish') {
                displayBotMessage('You have reached the finish line!');
            }
        }
        else if (currentCell.className != 'road' || (prevCell.className == currentCell.className)) {
            displayBotMessage('You drove the car off road.');
        }
        else {
            displayBotMessage('The car is back on the road.');
        }
    }
}

function moveCarTo(nextCell) {
    steerCarToward(nextCell);
    car.prevCell = car.currentCell;
    car.currentCell = nextCell;
    car.style.top = nextCell.style.top;
    car.style.left = nextCell.style.left;
}

//  must be called before moveCarTo(nextCell)
function steerCarToward(cell) {
    //  rotate the car
    if (car.currentCell) {
        var clockwise;
        var anitClockwise;

        if (car.prevCell) {
            clockwise = 
                (car.prevCell == car.currentCell.right && cell == car.currentCell.up) ||
                (car.prevCell == car.currentCell.left && cell == car.currentCell.down) ||
                (car.prevCell == car.currentCell.up && cell == car.currentCell.left) ||
                (car.prevCell == car.currentCell.down && cell == car.currentCell.right);

            anitClockwise =
                (car.prevCell == car.currentCell.right && cell == car.currentCell.down) ||
                (car.prevCell == car.currentCell.left && cell == car.currentCell.up) ||
                (car.prevCell == car.currentCell.up && cell == car.currentCell.right) ||
                (car.prevCell == car.currentCell.down && cell == car.currentCell.left);
        }
        else {
            clockwise = cell.up == car.currentCell;
            anitClockwise = cell.down == car.currentCell;
        }

        if (clockwise) {
            car.rotation += 90;
        }
        else if (anitClockwise) {
            car.rotation -= 90;
        }
        else if (cell == car.prevCell) {
            car.rotation -= 180;
        }
    }

    car.style.transform = `rotate(${car.rotation}deg)`;
}

function plotPath() {
    car.startCell = randomItemFrom(gridCells)[0];

    var prevRoadCell = car.startCell;
    var newRoadCell;
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

        newRoadCell.reachableRoads.push(prevRoadCell);
        prevRoadCell.reachableRoads.push(newRoadCell);

        //  assign appropriate road type image
        prevRoadCell.setRoadType(prevRoadCell.roadType.sort().join(''));
        removeDeadEnd(prevRoadCell);

        if (targetCell.className == 'road' || targetCell.deadend) {
            targetCell.setRoadType(targetCell.roadType.sort().join(''));
            removeDeadEnd(targetCell);
        }

        prevRoadCell = targetCell;
    };

    /*
        plot a single path from start to finish
    */

    prevRoadCell.roadType.push('left');

    moveCarTo(prevRoadCell);

    do {
        var filteredPaths = prevRoadCell.paths.filter(cell => cell != prevRoadCell.left);
        newRoadCell = randomItemFrom(filteredPaths);

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

    /*
        plot branches until entire map is filled
    */

    var branch = [];
    var emptyCells = gridCells.flat().filter(cell => cell.className == '' && cell.right != 'unknown');

    while (emptyCells.length > 0) {
        //  check if a branch is already created
        if (branch.length == 0) {
            //  select a cell from the first path
            var branchCell = randomItemFrom(gridCells.flat().filter(cell =>
                cell.className == 'road' &&
                cell.id != 'finish' &&
                cell.right != 'unknown' &&
                cell.right.right != 'unknown' &&
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
            if (newRoadCell.className != 'road' && srand() > deadends) {
                newRoadCell.deadend = true;
                remove(newRoadCell).from(emptyCells);
            }
        }

        //  remove paths that lead to the last column
        if (newRoadCell.right.right == 'unknown') {
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
    resizeGrid();
    
    //  create an array or undefined items whose length is equal to nRow
    var rows = new Array(nRow).fill();

    //  build the trackCells 2D array
    rows.forEach((row, rowIndex) => {
        //  create an array of undefined items whose length is equal to nColumn
        row = new Array(nColumn).fill();
        gridCells.push(row);

        row.forEach((cell, cellIndex) => {
            cell = document.createElement('div');
            cell.style.width = `${cellSize}vw`;
            cell.style.height = cell.style.width;
            cell.style.top = `${(100 / nRow) * rowIndex}%`;
            cell.style.left = `${(100 / nColumn) * cellIndex}%`;
            cell.endOfRow = cellIndex == nColumn - 1;
            row[cellIndex] = cell;
            grid.appendChild(cell);
        });
    });

    //  store neighbouring cells for each cell
    gridCells.forEach((row, nthRow) => {
        row.forEach((cell, nthColumn) => {
            cell.up = 'unknown';
            cell.down = 'unknown';
            cell.left = 'unknown';
            cell.right = 'unknown';
            cell.paths = [];
            cell.reachableRoads = [];
            cell.roadType = [];
            cell.setRoadType = type => {
                cell.className = 'road';
                cell.style.backgroundImage = `url('${imagePath}/road_${type}.png')`;
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

function displayUserMessage(message) {
    attachMessage(message, 'userMessage');
}

function displayBotMessage(message) {
    attachMessage(message, 'botMessage');
}

function attachMessage(message, type) {
    var text = document.createElement('p');
    
    text.className = type;
    text.textContent = message;
    messages.appendChild(text);

    userInput.value = '';
    messages.scrollTo(0, messages.scrollHeight);
}

function handleKeyPress() {
    if (event.keyCode == 13) {
        btnSend.click();
    }
}

function resizeGrid() {
    grid.style.height = `${90 * (nRow / nColumn)}vw`;
    title.style.fontSize = `${grid.offsetHeight * 0.2}px`;
}

function resizeContent() {
    resizeGrid();
    
    var contentRatio = content.offsetWidth / content.offsetHeight;
    var windowRatio = window.innerWidth / (window.innerHeight - chatbot.offsetHeight);
    var scaleRatio = contentRatio > windowRatio ? window.innerWidth * 0.9 / content.offsetWidth : (window.innerHeight - chatbot.offsetHeight) * 0.9 / content.offsetHeight;

    content.style.top = `${(window.innerHeight - chatbot.offsetHeight - content.offsetHeight) / 2}px`;
    content.style.transform = `scale(${scaleRatio})`;
}

var srand = new Math.seedrandom('101');

function randomIndexFrom(arr) {
    return Math.floor(srand() * arr.length);
}

function randomItemFrom(arr) {
    return arr[randomIndexFrom(arr)];
}

function remove(item) {
    return { from: arr => arr.splice(arr.indexOf(item), 1) };
}
