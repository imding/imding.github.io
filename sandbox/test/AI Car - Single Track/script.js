var content = document.querySelector('#content');
var grid = document.querySelector('#grid');
var car = document.querySelector('#car');

// var chatbot = document.querySelector('#chatbot');
// var messages = document.querySelector('#messages');
// var userInput = document.querySelector('#userInput');
// var btnSend = document.querySelector('#btnSend');

var btnRun = document.querySelector('#btnRun');

var nColumn = 10;
var nRow = 5;
var cellSize = 90 / nColumn;
var gridCells = [];
var track = [];
var path = [];
var userId = 'Ding';

window.onload = init;
window.onresize = resizeContent;
// window.onkeypress = handleKeyPress;
// btnSend.onclick = readUserInput;

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
//         sendMessage(command, 'userMessage');
        
//         if (command == 'run algorithm') {
//             navigateRoad();
//         }
//         else if (command == 'go right' || command == 'move right') {
//             goRight();
//         }
//         else if (command == 'go up') {
//             goUp();
//         }
//         else if (command == 'go down') {
//             goDown();
//         }
//         else if (command == 'go left') {
//             sendMessage('Sorry, I can not go back. Try going right, up or down.');
//         }
//     }
// }

// function sendMessage(message, type) {
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
    goRight(2);
    goUp(3);
    goRight();
    goDown(3);
    goRight(2);
    goDown();
    goRight();
    goUp();
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
            if (nextCell != track.shift()) {
                // sendMessage('The algorithm led the car off track. Check the navigateRoad function.', 'botMessage');
                console.log('The algorithm led the car off track. Check the navigateRoad function.');
            }
            
            moveCarTo(nextCell);
        }
        else {
            // sendMessage('The algorithm tries to lead the car off the grid. Check the navigateRoad function.', 'botMessage');
            console.log('The algorithm tries to lead the car off the grid. Check the navigateRoad function.');
        }
    }
    else {
        // sendMessage('Your algorithm worked!', 'botMessage');
        console.log('Your algorithm worked!');
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

        car.style.transform = `rotate(${rotation}deg)`;
    }

    car.prevCell = car.currentCell;
    car.currentCell = nextCell;
    car.currentRow = gridCells.filter(row => row.includes(nextCell))[0];
    car.style.top = nextCell.style.top;
    car.style.left = nextCell.style.left;
}

function plotPath() {
    var seedRandom = new Math.seedrandom(userId);
    var randomRowIndex = Math.floor(seedRandom() * gridCells.length);

    car.currentRow = gridCells[randomRowIndex];

    var prevCell = car.currentRow[0];
    var nextCell;

    prevCell.roadType.push('left');

    moveCarTo(prevCell);

    do {
        var randomBranchIndex = Math.floor(seedRandom() * prevCell.paths.length);

        nextCell = prevCell.paths[randomBranchIndex];
        nextCell.paths = nextCell.paths.filter(cell => cell != prevCell);
        
        if (nextCell.offsetTop > prevCell.offsetTop) {
            nextCell.roadType.push('up');
            prevCell.roadType.push('down');
        }
        else if (nextCell.offsetTop < prevCell.offsetTop) {
            nextCell.roadType.push('down');
            prevCell.roadType.push('up');
        }
        else {
            nextCell.roadType.push('left');
            prevCell.roadType.push('right');
        }

        //  assign appropriate road type image
        prevCell.setRoadType(prevCell.roadType.sort().join(''));

        if (nextCell.endOfRow) {
            nextCell.setRoadType('finish');
        }

        //  update prevCell for next loop iteration
        prevCell = nextCell;
        track.push(nextCell);
    }
    while (nextCell.endOfRow == false);
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
            cell.up = cell.down = cell.right = null;
            cell.paths = [];
            cell.roadType = [];
            cell.isConnectedTo = prevCell => {
                var pathUp = prevCell.roadType.includes('up') && cell.roadType.includes('down');
                var pathDown = prevCell.roadType.includes('down') && cell.roadType.includes('up');
                var pathRight = prevCell.roadType.includes('right') && cell.roadType.includes('left');

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

function resizeGrid() {
    grid.style.height = `${90 * (nRow / nColumn)}vw`;
}

function resizeContent() {
    resizeGrid();
    
    var contentRatio = content.offsetWidth / content.offsetHeight;
    // var windowRatio = window.innerWidth / (window.innerHeight - chatbot.offsetHeight);
    var windowRatio = window.innerWidth / (window.innerHeight - btnRun.offsetHeight);
    var scaleRatio = contentRatio > windowRatio ? window.innerWidth * 0.9 / content.offsetWidth : (window.innerHeight - btnRun.offsetHeight) * 0.9 / content.offsetHeight;

    content.style.top = `${(window.innerHeight - btnRun.offsetHeight - content.offsetHeight) / 2}px`;
    content.style.transform = `scale(${scaleRatio})`;
    
}