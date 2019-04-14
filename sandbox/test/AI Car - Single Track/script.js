var content = document.querySelector('#content');
var grid = document.querySelector('#grid');
var car = document.querySelector('#car');

// var chatbot = document.querySelector('#chatbot');
// var messages = document.querySelector('#messages');
// var userInput = document.querySelector('#userInput');
// var btnSend = document.querySelector('#btnSend');

var btnRun = document.querySelector('#btnRun');

var nColumn = 8;
var nRow = 5;
var cellSize = 90 / nColumn;
var gridCells = [];
var track = [];
var path = [];
var userId = 'Ding';

var imagePath = 'file:///C:/Users/Ding/Desktop/github/imding.github.io/images/ai_car/';

window.onload = init;
window.onresize = resizeContent;
// window.onkeypress = handleKeyPress;
// btnSend.onclick = readUserInput;

// btnSend.enable = () => {
//     btnSend.disabled = false;
//     btnSend.style.filter = 'inherit';
//     btnSend.style.opacity = 'inherit';
// };
// btnSend.disable = () => {
//     btnSend.disabled = true;
//     btnSend.style.filter = 'grayscale(0.6)';
//     btnSend.style.opacity = '0.6';
// };

btnRun.onclick = navigateRoad;

// function loadProfile() {
//     $BSD.profile.get().then(p => {
//         userId = p.userId;
//         init();
//     });
// }

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

// function readUserInput() {
//     var command = userInput.value.trim().replace(/\s+/g, ' ').toLowerCase();
    
//     if (command.length > 0) {
//         displayUserMessage(command);

//         btnSend.disable();

//         if (command == 'help') {
//             btnSend.enable();
//             displayBotMessage('Sure, here is a list of commands I can understand:');
//             displayBotMessage('go up: move the car up one cell.');
//             displayBotMessage('go down: move the car down one cell.');
//             displayBotMessage('go left: move the car to the left one cell.');
//             displayBotMessage('go right: move the car to the right one cell');
//             displayBotMessage('run algorithm: run the navigateRoad function.');
//         }
//         else if (command == 'run algorithm') {
//             navigateRoad();
//         }
//         else if (command == 'go up') {
//             goUp();
//         }
//         else if (command == 'go down') {
//             goDown();
//         }
//         else if (command == 'go left') {
//             goLeft();
//         }
//         else if (command == 'go right' || command == 'move right') {
//             goRight();
//         }
//         else {
//             btnSend.enable();
//             displayBotMessage(`Sorry, I didn't understand your command: ${command}`);
//         }
//     }
// }

// function displayUserMessage(message) {
//     attachMessage(message, 'userMessage');
// }

// function displayBotMessage(message) {
//     attachMessage(message, 'botMessage');
// }

// function attachMessage(message, type) {
//     var newMessage = document.createElement('div');
//     var avatar = document.createElement('img');
//     var text = document.createElement('p');
    
//     text.className = type;
//     text.textContent = message;
//     messages.appendChild(text);

//     userInput.value = '';
//     messages.scrollTo(0, messages.scrollHeight);
// }

// function handleKeyPress() {
//     if (event.keyCode == 13) {
//         btnSend.click();
//     }
// }

function navigateRoad() {
    btnRun.disabled = true;
    btnRun.style.filter = 'grayscale(0.6)';
    btnRun.style.opacity = '0.6';

    goRight(2);
    goUp(3);
    goRight();
    goDown(3);
    goRight(2);
    goUp();
    goRight();
    goDown();
    goRight();
    goUp(2);
    goRight();
    goUp(2);
    goRight();
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

function goLeft(n) {
    addToPath('left', n);
}

function addToPath(dir, n = 1) {
    //  check whether there is queued commands
    var queuedCommands = path.length > 0;

    while (n-- > 0) {
        var lastPathCell = path[path.length - 1] || car.currentCell;
        path.push(lastPathCell[dir]);
    }

    if (queuedCommands == false) nextMove();
}

function nextMove() {
    if (event && event.propertyName == 'transform') return;

    if (car.currentCell.id == 'finish') {
        // displayBotMessage('You have reached the finishe line!');
        alert('Your algorithm worked! The car has reached the finishe line!');
    }
    else if (path.length > 0) {
        var nextCell = path.shift();

        //  check if next cell exists on the grid
        if (nextCell == null) {
            // displayBotMessage('The algorithm tries to lead the car off the grid. Check the navigateRoad function.');
            // btnSend.enable();
            alert('The algorithm tries to lead the car off the grid. Please check the navigateRoad function.');
        }
        else {
            //  check if the first command is a valid move
            var goodStart = car.prevCell == null && car.currentCell.reachableRoads.includes(nextCell);

            if (goodStart || car.prevCell.reachableRoads.includes(car.currentCell)) {
                moveCarTo(nextCell);
            }
            else {
                // displayBotMessage('The algorithm led the car off track.');
                // btnSend.enable();
                alert('The algorithm led the car off track. Please check the navigateRoad function.');
            }
        }
    }
    else {
        // displayBotMessage(`Sucessfully moved from ${car.prevCell.location} to ${car.currentCell.location}`);
        // btnSend.enable();
        alert('The algorithm did not lead the car to the finish line.');
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
    var seedRandom = new Math.seedrandom(userId);

    car.currentRow = gridCells[Math.floor(seedRandom() * gridCells.length)];

    var prevRoadCell = car.currentRow[0];
    var newRoadCell;

    prevRoadCell.roadType.push('left');

    moveCarTo(prevRoadCell);

    do {
        var filteredPaths = prevRoadCell.paths.filter(cell => cell != prevRoadCell.left);
        newRoadCell = filteredPaths[Math.floor(seedRandom() * filteredPaths.length)];

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
        track.push(newRoadCell);
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
            cell.up = cell.down = cell.left = cell.right = null;
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

function resizeGrid() {
    grid.style.height = `${90 * (nRow / nColumn)}vw`;
}

function resizeContent() {
    resizeGrid();
    
    var contentRatio = content.offsetWidth / content.offsetHeight;
    var windowRatio = window.innerWidth / (window.innerHeight - btnRun.offsetHeight);
    var scaleRatio = contentRatio > windowRatio ? window.innerWidth * 0.9 / content.offsetWidth : (window.innerHeight - btnRun.offsetHeight) * 0.9 / content.offsetHeight;

    content.style.top = `${(window.innerHeight - btnRun.offsetHeight - content.offsetHeight) / 2}px`;
    content.style.transform = `scale(${scaleRatio})`;
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