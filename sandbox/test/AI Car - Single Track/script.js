var content = document.querySelector('#content');
var grid = document.querySelector('#grid');
var car = document.querySelector('#car');

// var chatbot = document.querySelector('#chatbot');
var messages = document.querySelector('#messages');
var userInput = document.querySelector('#userInput');
var btnSend = document.querySelector('#btnSend');

// var btnRun = document.querySelector('#btnRun');

var nColumn = 8;
var nRow = 5;
var cellSize = 90 / nColumn;
var gridCells = [];
var track = [];
var path = [];
var userId = 'Ding';

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

// btnRun.onclick = navigateRoad;

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

function readUserInput() {
    var command = userInput.value.trim().replace(/\s+/g, ' ').toLowerCase();
    
    if (command.length > 0) {
        displayUserMessage(command);

        btnSend.disable();

        if (command == 'run algorithm') {
            navigateRoad();
        }
        else if (command == 'go right' || command == 'move right') {
            goRight();
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
        else {
            displayBotMessage(`Sorry, I didn't understand your command: ${command}`);
            btnSend.enable();
        }
    }
}

function displayUserMessage(message) {
    attachMessage(message, 'userMessage');
}

function displayBotMessage(message) {
    attachMessage(message, 'botMessage');
}

function attachMessage(message, type) {
    var newMessage = document.createElement('div');
    var avatar = document.createElement('img');
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

function navigateRoad() {
    // btnRun.disabled = true;
    // btnRun.style.filter = 'grayscale(0.6)';
    // btnRun.style.opacity = '0.6';

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
    //  start the car after receving the first command
    if (path.length == 0) {
        setTimeout(nextMove, 200);
    }

    while (n--) {
        var pathEnd = path[path.length - 1] || car.currentCell;
        path.push(pathEnd[dir]);
    }
}

function nextMove() {
    if (event && event.propertyName == 'transform') return;

    if (path.length) {
        var nextCell = path.shift();

        if (nextCell) {
            if (car.currentCell.reachableRoads.includes(nextCell) == false) {
                displayBotMessage('The algorithm led the car off track.');
                // console.log('The algorithm led the car off track. Check the navigateRoad function.');
                btnSend.enable();
            }
            else if (nextCell.id == 'finish') {
                displayBotMessage('You have reached the finishe line! ');
                // console.log('Your algorithm worked!');
            }
            
            moveCarTo(nextCell);
        }
        else {
            displayBotMessage('The algorithm tries to lead the car off the grid. Check the navigateRoad function.');
            // console.log('The algorithm tries to lead the car off the grid. Check the navigateRoad function.');
            btnSend.enable();
        }
    }
    else {
        displayBotMessage(`Sucessfully moved from ${car.prevCell.location} to ${car.currentCell.location}`);
        btnSend.enable();
    }
}

function moveCarTo(nextCell) {
    //  rotate the car
    if (car.currentCell) {
        var clockwise;
        var anitClockwise;

        if (car.prevCell) {
            clockwise = 
                (car.prevCell == car.currentCell.right && nextCell == car.currentCell.up) ||
                (car.prevCell == car.currentCell.left && nextCell == car.currentCell.down) ||
                (car.prevCell == car.currentCell.up && nextCell == car.currentCell.left) ||
                (car.prevCell == car.currentCell.down && nextCell == car.currentCell.right);

            anitClockwise =
                (car.prevCell == car.currentCell.right && nextCell == car.currentCell.down) ||
                (car.prevCell == car.currentCell.left && nextCell == car.currentCell.up) ||
                (car.prevCell == car.currentCell.up && nextCell == car.currentCell.right) ||
                (car.prevCell == car.currentCell.down && nextCell == car.currentCell.left);
        }
        else {
            clockwise = nextCell.up == car.currentCell;
            anitClockwise = nextCell.down == car.currentCell;
        }

        if (clockwise) {
            car.rotation += 90;
        }
        else if (anitClockwise) {
            car.rotation -= 90;
        }
        else if (nextCell == car.prevCell) {
            car.rotation -= 180;
        }
    }
    
    car.prevCell = car.currentCell;
    car.currentCell = nextCell;
    car.currentRow = gridCells.filter(row => row.includes(nextCell))[0];
    car.style.top = nextCell.style.top;
    car.style.left = nextCell.style.left;
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

function resizeGrid() {
    grid.style.height = `${90 * (nRow / nColumn)}vw`;
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
    return {
        from: arr => arr.splice(arr.indexOf(item), 1),
    };
}