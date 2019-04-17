var content = document.querySelector('#content');
var title = document.querySelector('#title');
var grid = document.querySelector('#grid');
var car = document.querySelector('#car');

var chatbot = document.querySelector('#chatbot');
var messages = document.querySelector('#messages');
var userInput = document.querySelector('#userInput');
var btnSend = document.querySelector('#btnSend');

var nColumn = 5;
var nRow = 3;
var cellSize = 90 / nColumn;
var gridCells = [];
var roadCells = [];

var autoMode = false;

// var imagePath = 'file:///C:/Users/Ding/Desktop/github/imding.github.io/images/ai_car/';
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
    
    //  handle the transitionend event using the nextCommand function
    car.addEventListener('transitionend', nextMove);

    resizeContent();
}

function readUserInput() {
    var command = userInput.value.trim().replace(/\s+/g, ' ').toLowerCase();
    
    if (command.length > 0) {
        displayUserMessage(command);

        btnSend.disable();

        if (command == 'help') {
            btnSend.enable();
            displayBotMessage('Sure, here is a list of commands I can understand:');
            displayBotMessage('go up: move the car up one cell.');
            displayBotMessage('go down: move the car down one cell.');
            displayBotMessage('go left: move the car to the left one cell.');
            displayBotMessage('go right: move the car to the right one cell.');
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
        else if (command == 'auto mode') {
            autoMode = true;
            nextMove();
        }
        else {
            btnSend.enable();
            displayBotMessage(`Sorry, I didn't understand your command: ${command}`);
        }
    }
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

function nextMove() {
    if (event && event.propertyName == 'transform') return;
    
    var currentCell = car.currentCell;
    var prevCell = car.prevCell;

    if (autoMode == true) {
        var cellRight = currentCell.right;

        if (cellRight != prevCell && currentCell.reachableRoads.includes(cellRight)) {
            moveCarTo(cellRight);
        }
        else {
            var cellUp = currentCell.up;

            if (cellUp != prevCell && currentCell.reachableRoads.includes(cellUp)) {
                moveCarTo(cellUp);
            }
            else {
                var cellDown = currentCell.down;

                if (cellDown != prevCell && currentCell.reachableRoads.includes(cellDown)) {
                    moveCarTo(cellDown);
                }
                else {
                    var cellLeft = currentCell.left;

                    if (cellLeft != prevCell && currentCell.reachableRoads.includes(cellLeft)) {
                        moveCarTo(cellLeft);
                    }
                    else {
                        autoMode = false;
    
                        if (currentCell.id == 'finish') {
                            displayBotMessage('Your AutoNav system worked, the car has reached the finish line!');
                        }
                        else if (currentCell.reachableRoads.length == 0) {
                            displayBotMessage('The AutoNav system failed to determine where to go next.');
                        }
                        else if (currentCell.reachableRoads.length == 1) {
                            displayBotMessage('Returned to starting cell, turning around...');
                            moveCarTo(currentCell.reachableRoads[0]);
                            autoMode = true;
                        }
                    }
                }
            }
        }
    }
    else {
        btnSend.enable();

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
    car.currentRow = gridCells.filter(row => row.includes(nextCell))[0];
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
    car.currentRow = randomItemFrom(gridCells);

    var prevRoadCell = car.currentRow[0];
    var newRoadCell;

    prevRoadCell.roadType.push('left');

    moveCarTo(prevRoadCell);

    do {
        var filteredPaths = prevRoadCell.paths.filter(cell => cell != prevRoadCell.left);
        newRoadCell = randomItemFrom(filteredPaths);

        remove(prevRoadCell).from(newRoadCell.paths);
        
        if (newRoadCell.up == prevRoadCell) {
            newRoadCell.roadType.push('up');
            prevRoadCell.roadType.push('down');
        }
        else if (newRoadCell.down == prevRoadCell) {
            newRoadCell.roadType.push('down');
            prevRoadCell.roadType.push('up');
        }
        else {
            newRoadCell.roadType.push('left');
            prevRoadCell.roadType.push('right');
        }
        
        newRoadCell.reachableRoads.push(prevRoadCell);
        prevRoadCell.reachableRoads.push(newRoadCell);

        //  assign appropriate road type image
        prevRoadCell.setRoadType(prevRoadCell.roadType.sort().join(''));

        //  update prevCell for next loop iteration
        prevRoadCell = newRoadCell;
        roadCells.push(newRoadCell);
    }
    while (newRoadCell.endOfRow == false);

    newRoadCell.setRoadType('finish');
    newRoadCell.id = 'finish';
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
            cell.up = cell.down = cell.left = cell.right = 'unknown';
            cell.paths = [];
            cell.reachableRoads = [];
            cell.roadType = [];
            cell.row = nthRow;
            cell.column = nthColumn;
            cell.location = `(x: ${nthColumn + 1}, y: ${nthRow + 1})`;
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

function randomIndexFrom(arr) {
    return Math.floor(Math.random() * arr.length);
}

function randomItemFrom(arr) {
    return arr[randomIndexFrom(arr)];
}

function remove(item) {
    return { from: arr => arr.splice(arr.indexOf(item), 1) };
}