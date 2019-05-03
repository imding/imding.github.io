var content = document.querySelector('#content');
var grid = document.querySelector('#grid');
var car = document.querySelector('#car');
var btnRun = document.querySelector('#btnRun');

var nColumn = 15;
var nRow = 10;
var cellSize = 90 / nColumn;
var gridCells = [];
var track = [];
var path = [];
var seed = `eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJlbWFpbCI6InNkQGJzZC5lZHVjYXRpb24iLCJuYW1lIjoiU2l1bGluZyBEaW5nIiwiZ2l2ZW5fbmFtZSI6IlNpdWxpbmciLCJmYW1pbHlfbmFtZSI6IkRpbmciLCJwaWN0dXJlIjoiaHR0cHM6Ly9saDQuZ29vZ2xldXNlcmNvbnRlbnQuY29tLy1kb29Xa216ZGUxRS9BQUFBQUFBQUFBSS9BQUFBQUFBQUFBOC9HZnRZeHVKblFEby9waG90by5qcGciLCJsb2NhbGUiOiJlbiIsIm5pY2tuYW1lIjoic2QiLCJ1c2VyX21ldGFkYXRhIjp7fSwiYXBwX21ldGFkYXRhIjp7ImxiX3VzZXJfaWQiOiIxMzE1YjAyMi0zNzE1LTRlNTQtYWEzMS1lOTE3YzUzZmIwYmUifSwicm9sZXMiOlsiYWRtaW4iXSwicGVybWlzc2lvbnMiOnsiYXNzaWdubWVudHMiOnsiYWxsUGVybWlzc2lvbnMiOnRydWV9LCJjb3Vyc2VzIjp7ImFsbFBlcm1pc3Npb25zIjp0cnVlfSwiY2xhc3Nyb29tIjp7ImFsbFBlcm1pc3Npb25zIjp0cnVlfX0sImxiX3VzZXJfaWQiOiIxMzE1YjAyMi0zNzE1LTRlNTQtYWEzMS1lOTE3YzUzZmIwYmUiLCJuZWVkX2VtYWlsX3ZlcmlmaWNhdGlvbiI6ZmFsc2UsIm9yZ2FuaXNhdGlvbnMiOlt7ImlkIjoiYjRlMzNmMTgtNDI5Zi00MjAyLTljYjItODcyYzM0ODhjMWI3IiwidGl0bGUiOiJCU0QgU3RhZmYiLCJ0eXBlIjoib3JnIiwicm9sZSI6InRlYWNoZXIiLCJsb2dvIjpudWxsfV0sImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJjbGllbnRJRCI6IkY3RVdBWGNhYXQ5STdNY0J3VDcxUU9LUmdrWFhmSzdsIiwidXBkYXRlZF9hdCI6IjIwMTktMDQtMjZUMjE6MDA6NDQuNDUwWiIsInVzZXJfaWQiOiJnb29nbGUtb2F1dGgyfDEwNjA4OTU1MjExMjMzMDk2MzY4MyIsImlkZW50aXRpZXMiOlt7InByb3ZpZGVyIjoiZ29vZ2xlLW9hdXRoMiIsInVzZXJfaWQiOiIxMDYwODk1NTIxMTIzMzA5NjM2ODMiLCJjb25uZWN0aW9uIjoiZ29vZ2xlLW9hdXRoMiIsImlzU29jaWFsIjp0cnVlfV0sImNyZWF0ZWRfYXQiOiIyMDE2LTEwLTE4VDA3OjM0OjE3LjYwNloiLCJpc3MiOiJodHRwczovL2xvZ2luLmJzZC5lZHVjYXRpb24vIiwic3ViIjoiZ29vZ2xlLW9hdXRoMnwxMDYwODk1NTIxMTIzMzA5NjM2ODMiLCJhdWQiOiJGN0VXQVhjYWF0OUk3TWNCd1Q3MVFPS1Jna1hYZks3bCIsImlhdCI6MTU1NjMxMjQ0NSwiZXhwIjoxNTU2OTYwNDQ1LCJhdF9oYXNoIjoiRVdJU05odEVpQ3VoX0ZrOUZvLUZGdyIsIm5vbmNlIjoiMWVNZmVkQ0lmVENvQ1ZTU3F4R0FVc2FhbEYzQjdmQXcifQ.dQ9zUjgGDdY6ixJUxm9bEAjGX4L8KZFADoKJkRhKcsQ${nColumn}${nRow}`;

var imagePath = 'https://app.bsd.education/resources';

window.onload = init;
window.onresize = resizeContent;

btnRun.onclick = navigateRoad;

btnRun.disable = () => {
    btnRun.disabled = true;
    btnRun.style.filter = 'grayscale(0.6)';
    btnRun.style.opacity = '0.6';
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

function navigateRoad() {
    btnRun.disable();

    goRight();
    goDown(3);

    nextMove();
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
    // var queuedCommands = path.length > 0;

    while (n-- > 0) {
        var lastPathCell = path[path.length - 1] || car.currentCell;
        path.push(lastPathCell[dir]);
    }

    // if (queuedCommands == false) nextMove();
}

function nextMove() {
    if (event && event.propertyName == 'transform') return;

    if (car.currentCell.id == 'finish') {
        alert('Your algorithm worked! The car has reached the finishe line!');
    }
    else if (path.length > 0) {
        var nextCell = path.shift();

        //  check if next cell exists on the grid
        if (nextCell == null) {
            alert('The algorithm tries to lead the car off the grid. Please check the navigateRoad function.');
        }
        else if (car.prevCell == null || car.prevCell.reachableRoads.includes(car.currentCell)) {
            moveCarTo(nextCell);
        }
        else {
            alert('The algorithm led the car off track. Please check the navigateRoad function.');
        }
    }
    else {
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
    var seedRandom = new Math.seedrandom(seed);

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