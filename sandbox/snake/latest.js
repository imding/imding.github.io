// Segment types of the snake
var SegmentType = Object.freeze({ 'head': 1, 'body': 2, 'tail': 3 });
// Directions the snake can travel
var Direction = Object.freeze({ 'up': { 'x': 0, 'y': -1 }, 'down': { 'x': 0, 'y': 1 }, 'right': { 'x': 1, 'y': 0 }, 'left': { 'x': -1, 'y': 0 } });

// Array of the snakes playing the game
var snakes = [];

// Array of obstacles for the current game mode
let obstacles = [];

// The current apple on the screen
var apple;

// How big each grid is (px)
var gridSize = 20;
// How many grids are in the canvas
var tileCount = 40;
// How many times the scene is redrawn, per second
var refreshRate = 8;

// Boolean indicating whether two-player mode is on or off
var isTwoPlayer = false;
// Boolean indicating whether the game is currently in progress
var gameHasStarted = false;

var player1Name;
var player2Name;

// Define the function to be called when the window loads
window.onload = function () {

    // Set up the graphics
    gc.width = tileCount * gridSize;
    gc.height = tileCount * gridSize;
    ctx = gc.getContext('2d');

    playerCheckbox.onchange = function () {
        isTwoPlayer = playerCheckbox.checked;
    };

    // Draw the opening screen
    drawStartingScreen();

    // Add listener for key presses
    document.addEventListener('keydown', keyPush);
    playButton.addEventListener('click', selectMode);

};

function selectMode() {

    if (isTwoPlayer) {
        pointsLabel.style.visibility = 'hidden';
        askForPlayerNames();
    } else {
        pointsLabel.style.visibility = 'visible';
        startGame();
    }
    setButtonsVisibility('hidden');

}

function askForPlayerNames() {

    showNamePopup('Player 1 (left snake), what is your name?', function () {

        showNamePopup('Player 2 (right snake), what is your name?', function () {

            startGame();

        });

    });

}

function showNamePopup(text, handler) {

    const popupBackground = document.createElement('div');

    popupBackground.style.position = 'absolute';
    popupBackground.style.width = `${window.innerWidth}px`;
    popupBackground.style.height = `${window.innerHeight}px`;
    popupBackground.style.left = '0px';
    popupBackground.style.top = '0px';

    popupBackground.style.backgroundColor = 'white';
    popupBackground.style.opacity = '0.7';

    document.body.appendChild(popupBackground);

    const banner = document.createElement('div');

    banner.style.position = 'absolute';
    banner.style.width = `${window.innerWidth}px`;
    banner.style.height = '200px';

    document.body.appendChild(banner);

    banner.style.left = '0px';
    banner.style.top = `${window.innerHeight / 2 - banner.offsetHeight / 2}px`;

    banner.style.backgroundColor = 'black';
    banner.style.opacity = '1.0';

    const prompt = document.createElement('h3');

    prompt.style.position = 'absolute';
    prompt.style.width = `${banner.offsetWidth}px`;
    prompt.style.height = '30px';

    banner.appendChild(prompt);

    prompt.style.top = `${banner.offsetHeight / 4}px`;
    prompt.style.left = '0px';

    prompt.style.margin = '0 0 0 0';
    prompt.style.fontSize = '25px';
    prompt.style.color = 'white';
    prompt.style.fontFamily = 'Nunito';
    prompt.textContent = text;

    var input = document.createElement('input');

    input.type = 'text';
    input.style.position = 'absolute';
    input.style.width = '200px';
    input.style.textAlign = 'center';

    banner.appendChild(input);

    input.style.left = `${banner.offsetWidth / 2 - input.offsetWidth / 2}px`;
    input.style.top = `${prompt.offsetTop + prompt.offsetHeight + 25}px`;
    input.focus();
    input.value = 'Snake';

    const okayButton = document.createElement('button');

    okayButton.textContent = 'Okay';
    okayButton.style.position = 'absolute';
    okayButton.style.textAlign = 'center';
    okayButton.style.borderRadius = '5px';

    banner.appendChild(okayButton);

    okayButton.style.left = `${banner.offsetWidth / 2 - okayButton.offsetWidth / 2}px`;
    okayButton.style.top = `${input.offsetTop + input.offsetHeight + 10}px`;

    okayButton.onclick = () => {
        // validate user input
        if (!input.value.trim().length) return;

        if (player1Name == null) {
            player1Name = input.value;
        } else {
            player2Name = input.value;
        }

        document.body.removeChild(popupBackground);
        document.body.removeChild(banner);

        handler();

    };

}

// Function: hide/show difficulty buttons and label 
function setButtonsVisibility(visibility) {

    playButton.style.visibility = visibility;
    playerLabel.style.visibility = visibility;
    playerSwitch.style.visibility = visibility;
    playerCheckbox.style.visibility = visibility;
    slider.style.visibility = visibility;

}

// Function: starting the game (canvas starts to refresh)
function startGame() {

    gameHasStarted = true;

    // Create how many snakes you want
    createSnakes();

    // Create the obstacles on the map
    createObstacles();

    // Randomize the location of the starting apple
    spawnNewApple();

    // Start the graphics, at a 15 refreshes per second rate
    window.refresher = setInterval(refreshGame, 1000 / refreshRate);

}

function createSnakes() {

    snakes = [];

    const snake1 = new Snake(1, 9, 'indianred', player1Name);
    snake1.control = { up: 'KeyW', down: 'KeyS', left: 'KeyA', right: 'KeyD' };
    snakes.push(snake1);



    if (isTwoPlayer) {
        const snake2 = new Snake(18, 9, 'skyblue', player2Name);
        snake2.control = { up: 'ArrowUp', down: 'ArrowDown', left: 'ArrowLeft', right: 'ArrowRight' };
        snakes.push(snake2);
    }


}

function createObstacles() {

    obstacles = [];

    const obstacle1 = new Obstacle(5, 9, 5, 2);
    const obstacle2 = new Obstacle(12, 9, 5, 2);

    obstacles.push(obstacle1);
    obstacles.push(obstacle2);

}

// Function: called multiple times a second to refresh the canvas
function refreshGame() {

    clearCanvas();

    // Draw the apple
    apple.draw(ctx);

    obstacles.forEach(obs => obs.draw(ctx));

    refreshSnakes();

    // Check if snakes have run into each other
    checkForSnakeCollision();

    updatePointsLabel();

}

function refreshSnakes() {
    var losingSnakes = [];
    // If any snake draw fails, stop all drawing
    snakes.forEach(snake => {
        if (snake.draw(ctx)) {
            snake.checkForApple();
        } else {
            losingSnakes.push(snake);
        }
    });

    if (losingSnakes.length == 2) {
        alert('You both lost! Rematch!');
        resetGame();
    }
}

function checkForSnakeCollision() {

    var losingSnakes = [];
    snakes.forEach(snake => {
        if (snake.checkForSnakeCollision()) {

            if (snake.invincible) {
                losingSnakes.push(snake.hitTarget);
            }
            else {
                losingSnakes.push(snake);
            }

        }
    });

    if (losingSnakes.length) {
        playerLoses(losingSnakes);
    }

}

// Function: resetting the game (if the player dies)
function resetGame() {

    player1Name = null;
    player2Name = null;

    // Draw the starting snake screen
    drawStartingScreen();

    // Make the buttons visible again
    setButtonsVisibility('visible');

    updatePointsLabel();
}

// Function: handles the playing-losing event
function playerLoses(losingSnakes) {

    gameHasStarted = false;

    // Stop the canvas from refreshing
    clearInterval(window.refresher);

    if (losingSnakes.length == 2 && losingSnakes[0].trueColor != losingSnakes[1].trueColor) {
        alert('It is a tie! Rematch!');
        resetGame();
    }
    else {
        // Draw the screen showing the "L" snake
        drawLosingScreen(losingSnakes[0].trueColor);

        // Wait 3 seconds, and then reset the game
        setTimeout(resetGame, 3000);
    }

}

function spawnNewApple() {
    apple = new Apple();
}

function clearCanvas() {

    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, gc.width, gc.height);

}

function updatePointsLabel() {
    pointsLabel.innerHTML = gameHasStarted ? 'Points: ' + String(snakes[0].points) : 'Points: 0';
}

function keyPush(evt) {

    if (!gameHasStarted) {
        return;
    }

    evt.preventDefault();

    snakes.forEach(snake => {
        if (evt.code === snake.control.up) {
            snake.setDirection(Direction.up);
        }
        else if (evt.code === snake.control.down) {
            snake.setDirection(Direction.down);
        }
        else if (evt.code === snake.control.left) {
            snake.setDirection(Direction.left);
        }
        else if (evt.code === snake.control.right) {
            snake.setDirection(Direction.right);
        }
    });

}

function drawLosingScreen(color) {

    clearCanvas();

    var mod = (tileCount / gridSize) * gridSize;

    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, gc.width, gc.height);

    ctx.fillStyle = color;
    ctx.fillRect(6 * mod, 3 * mod, 8 * mod, 14 * mod);

    ctx.fillStyle = 'black';
    ctx.fillRect(8 * mod, 3 * mod, 6 * mod, 12 * mod);

    // Draw the triangle tail
    ctx.beginPath();
    ctx.moveTo(13 * mod, 15 * mod);
    ctx.lineTo(14 * mod, 16 * mod);
    ctx.lineTo(14 * mod, 15 * mod);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(13 * mod, 17 * mod);
    ctx.lineTo(14 * mod, 16 * mod);
    ctx.lineTo(14 * mod, 17 * mod);
    ctx.fill();

    // Draw the eyes
    ctx.fillStyle = 'white';
    ctx.fillRect(6 * mod + 1 / 3 * mod, 3 * mod + 1 / 3 * mod, 1 / 3 * mod, 1 / 3 * mod);
    ctx.fillRect(7 * mod + 1 / 3 * mod, 3 * mod + 1 / 3 * mod, 1 / 3 * mod, 1 / 3 * mod);

    // Draw the tongue
    ctx.fillStyle = 'pink';
    ctx.fillRect(6 * mod + 5 / 6 * mod, 2.5 * mod, 1 / 3 * mod, 1 / 2 * mod);
    ctx.beginPath();
    ctx.moveTo(7 * mod, 2.5 * mod);
    ctx.lineTo(7 * mod, 2 * mod + 3 / 8 * mod);
    ctx.lineTo(6.5 * mod, 2 * mod);
    ctx.lineTo(6 * mod + 5 / 6 * mod, 2.5 * mod);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(7 * mod, 2.5 * mod);
    ctx.lineTo(7 * mod, 2 * mod + 3 / 8 * mod);
    ctx.lineTo(7.5 * mod, 2 * mod);
    ctx.lineTo(7 * mod + 1 / 6 * mod, 2.5 * mod);
    ctx.fill();

}

function drawStartingScreen() {

    clearCanvas();

    var mod = (tileCount / gridSize) * gridSize;

    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, gc.width, gc.height);

    ctx.fillStyle = 'green';
    ctx.fillRect(6 * mod, 3 * mod, 8 * mod, 14 * mod);

    ctx.fillStyle = 'black';
    ctx.fillRect(8 * mod, 5 * mod, 6 * mod, 4 * mod);
    ctx.fillRect(6 * mod, 11 * mod, 6 * mod, 4 * mod);

    // Draw the triangle tail
    ctx.beginPath();
    ctx.moveTo(7 * mod, 15 * mod);
    ctx.lineTo(6 * mod, 16 * mod);
    ctx.lineTo(6 * mod, 15 * mod);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(7 * mod, 17 * mod);
    ctx.lineTo(6 * mod, 16 * mod);
    ctx.lineTo(6 * mod, 17 * mod);
    ctx.fill();

    // Draw the eyes
    ctx.fillStyle = 'white';
    ctx.fillRect(13 * mod + 1 / 3 * mod, 3 * mod + 1 / 3 * mod, 1 / 3 * mod, 1 / 3 * mod);
    ctx.fillRect(13 * mod + 1 / 3 * mod, 4 * mod + 1 / 3 * mod, 1 / 3 * mod, 1 / 3 * mod);

    // Draw the tongue
    ctx.fillStyle = 'pink';
    ctx.fillRect(14 * mod, 3 * mod + 5 / 6 * mod, 1 / 2 * mod, 1 / 3 * mod);
    ctx.beginPath();
    ctx.moveTo(14.5 * mod, 4 * mod);
    ctx.lineTo(14 * mod + 5 / 8 * mod, 4 * mod);
    ctx.lineTo(15 * mod, 3.5 * mod);
    ctx.lineTo(14.5 * mod, 3 * mod + 5 / 6 * mod);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(14.5 * mod, 4 * mod);
    ctx.lineTo(14 * mod + 5 / 8 * mod, 4 * mod);
    ctx.lineTo(15 * mod, 4.5 * mod);
    ctx.lineTo(14.5 * mod, 4 * mod + 1 / 6 * mod);
    ctx.fill();

}

class Snake {

    constructor(x, y, color, name = 'Snakey') {
        // An array of SnakeSegments
        this.segments = [];

        this.color = color;
        this.trueColor = color;

        this.name = name;

        this.direction = Direction.up;
        this.pendingTurn = false;

        // Coordinates of the head of the snake
        this.x = x;
        this.y = y;

        this.prevTailPos = {
            x: 0,
            y: 0
        };

        this.points = 0;

        this.invincible;
        this.hitTarget;

        this.generateSnake();
    }

    generateSnake() {

        // Create the initial snake
        const startSize = 5;
        for (var i = 0; i < startSize; i++) {

            var segment;
            if (!i) {
                segment = new SnakeSegment(this.x, this.y, this.color, SegmentType.head);
            } else if (i === startSize - 1) {
                segment = new SnakeSegment(this.x, this.y, this.color, SegmentType.tail);
            } else {
                segment = new SnakeSegment(this.x, this.y, this.color, SegmentType.body);
            }
            this.segments.push(segment);

        }

    }

    drawSnakeTail() {

        const tail = this.tail;

        const preTail = this.getSegment(this.segments.length - 2);

        // Get the direction that the tail is moving in
        var tailXVelocity = preTail.position.x - tail.position.x;
        var tailYVelocity = preTail.position.y - tail.position.y;

        switch (tailXVelocity) {
            case 1:
                ctx.beginPath();
                ctx.moveTo(tail.position.x * gridSize + 18, tail.position.y * gridSize);
                ctx.lineTo(tail.position.x * gridSize + 18, tail.position.y * gridSize + 18);
                ctx.lineTo(tail.position.x * gridSize, tail.position.y * gridSize + 9);
                ctx.fill();
                break;
            case -1:
                ctx.beginPath();
                ctx.moveTo(tail.position.x * gridSize, tail.position.y * gridSize);
                ctx.lineTo(tail.position.x * gridSize, tail.position.y * gridSize + 18);
                ctx.lineTo(tail.position.x * gridSize + 18, tail.position.y * gridSize + 9);
                ctx.fill();
                break;
            case 0:
                switch (tailYVelocity) {
                    case 1:
                        ctx.beginPath();
                        ctx.moveTo(tail.position.x * gridSize, tail.position.y * gridSize + 18);
                        ctx.lineTo(tail.position.x * gridSize + 18, tail.position.y * gridSize + 18);
                        ctx.lineTo(tail.position.x * gridSize + 9, tail.position.y * gridSize);
                        ctx.fill();
                        break;
                    case -1:
                        ctx.beginPath();
                        ctx.moveTo(tail.position.x * gridSize, tail.position.y * gridSize);
                        ctx.lineTo(tail.position.x * gridSize + 18, tail.position.y * gridSize);
                        ctx.lineTo(tail.position.x * gridSize + 9, tail.position.y * gridSize + 18);
                        ctx.fill();
                        break;
                }
        }

    }

    drawSnakeEyes() {

        const head = this.head;

        // Giving the snake eyes based off of its direction
        switch (this.direction.x) {
            case 1:
                ctx.fillStyle = 'white';
                ctx.fillRect(head.position.x * gridSize + 12, head.position.y * gridSize + 3, 4, 4);
                ctx.fillRect(head.position.x * gridSize + 12, head.position.y * gridSize + 11, 4, 4);
                break;
            case -1:
                ctx.fillStyle = 'white';
                ctx.fillRect(head.position.x * gridSize + 2, head.position.y * gridSize + 3, 4, 4);
                ctx.fillRect(head.position.x * gridSize + 2, head.position.y * gridSize + 11, 4, 4);
                break;
            case 0:
                switch (this.direction.y) {
                    case 1:
                        ctx.fillStyle = 'white';
                        ctx.fillRect(head.position.x * gridSize + 3, head.position.y * gridSize + 12, 4, 4);
                        ctx.fillRect(head.position.x * gridSize + 11, head.position.y * gridSize + 12, 4, 4);
                        break;
                    case -1:
                        ctx.fillStyle = 'white';
                        ctx.fillRect(head.position.x * gridSize + 3, head.position.y * gridSize + 2, 4, 4);
                        ctx.fillRect(head.position.x * gridSize + 11, head.position.y * gridSize + 2, 4, 4);
                        break;
                }
        }
        ctx.fillStyle = this.color;

    }

    // Called to draw the entire snake
    draw(ctx) {

        ctx.fillStyle = this.color;

        const success = this.updatePositions();

        if (!success) {
            return false;
        }

        if (!gameHasStarted) return true;
        
        for (var i = 0; i < this.segments.length; i++) {

            // If drawing the tail
            if (i == this.segments.length - 1) {
                this.drawSnakeTail();
            } else {

                ctx.fillRect(this.segments[i].x * gridSize, this.segments[i].y * gridSize, gridSize - 2, gridSize - 2);

                // If drawing the head
                if (!i) {
                    this.drawSnakeEyes();
                }

            }

        }

        return true;

    }

    updatePositions() {

        this.pendingTurn = false;

        // Expressions account for vertical and horizontal wrapping
        const newX = this.x + this.direction.x > tileCount - 1 ? 0 : (this.x + this.direction.x < 0 ? tileCount - 1 : this.x + this.direction.x);
        const newY = this.y + this.direction.y > tileCount - 1 ? 0 : (this.y + this.direction.y < 0 ? tileCount - 1 : this.y + this.direction.y);

        this.x = newX;
        this.y = newY;

        // Check if the snake ran into an obstacle
        const collision = obstacles.some(obstacle => {
            return obstacle.isCollision(this.x, this.y);
        });

        if (collision) {
            playerLoses([this]);
            return false;
        }

        // Go through the segments from the tail to the head, assigning each segment's x and y equal to the next segment's position
        for (var i = this.segments.length - 1; i >= 0; i--) {

            if (!i) { // For the head

                this.segments[i].setPosition(this.x, this.y);

            } else {

                if (i === this.segments.length - 1) {
                    this.prevTailPos = {
                        x: this.segments[i].x,
                        y: this.segments[i].y
                    };
                }

                const nextX = this.segments[i - 1].x;
                const nextY = this.segments[i - 1].y;

                if (nextX === this.x && nextY === this.y) {
                    playerLoses([this]);
                    return false;
                }

                this.segments[i].setPosition(nextX, nextY);
            }

        }
        return true;

    }

    checkForApple() {

        if (this.x === apple.position.x && this.y === apple.position.y) {

            if (apple.gold) {
                this.invincible = true;
                this.color = 'gold';
                setTimeout(() => {
                    this.color = this.trueColor;
                    this.invincible = false;
                }, 6000);
            }
            else {
                this.points++;
                this.addSegment();
            }


            spawnNewApple();
        }

    }

    // Checks if this snake has run into any other snake
    checkForSnakeCollision() {

        return snakes.some(snake => {
            if (snake !== this) {

                return snake.segments.some(segment => {
                    if (segment.position.x === this.x && segment.position.y === this.y) {
                        this.hitTarget = snake;
                        return true;
                    } else return false;
                });

            }
        });

    }

    addSegment() {

        const tailSegment = this.segments[this.segments.length - 1];

        const newSegment = new SnakeSegment(tailSegment.position.x, tailSegment.position.y, this.color, SegmentType.body);

        this.segments.splice(this.segments.length - 1, 0, newSegment);

        tailSegment.setPosition(this.prevTailPos.x, this.prevTailPos.y);

    }

    setDirection(direction) {

        if (this.pendingTurn) {
            return;
        }
        else {
            this.pendingTurn = true;
        }

        // To prevent 180 degree turns
        switch (direction) {
            case Direction.up:
                if (this.direction === Direction.down) return false;
                break;
            case Direction.down:
                if (this.direction === Direction.up) return false;
                break;
            case Direction.left:
                if (this.direction === Direction.right) return false;
                break;
            case Direction.right:
                if (this.direction === Direction.left) return false;
                break;
        }

        this.direction = direction;

    }

    get head() {
        return this.segments[0];
    }

    get tail() {
        return this.segments[this.segments.length - 1];
    }

    getSegment(i) {
        return this.segments[i];
    }

}

class SnakeSegment {

    constructor(x, y, color, type) {
        this.x = x;
        this.y = y;

        this.color = color;

        // SegmentType
        this.type = type;
    }

    setPosition(x, y) {

        this.x = x;
        this.y = y;

    }

    get position() {
        return {
            x: this.x,
            y: this.y
        };
    }

}

class Obstacle {

    constructor(x, y, width, height) {

        this.x = x;
        this.y = y;

        this.width = width;
        this.height = height;

    }

    draw(ctx) {

        ctx.fillStyle = 'silver';
        for (var i = 0; i < this.width; i++) {

            for (var j = 0; j < this.height; j++) {

                ctx.fillRect(this.x * gridSize + i * gridSize, this.y * gridSize + j * gridSize, gridSize - 2, gridSize - 2);

            }

        }

    }

    isCollision(x, y) {

        if (x >= this.x && x < this.x + this.width && y >= this.y && y < this.y + this.height) {
            return true;
        }
        else {
            return false;
        }

    }

}

class Apple {

    constructor() {

        this.x = 0;
        this.y = 0;
        this.gold = Math.random() > 0.3;

        this.initPosition();
    }

    initPosition() {

        var collision = false;
        do {

            this.x = Math.floor(Math.random() * tileCount);
            this.y = Math.floor(Math.random() * tileCount);

            collision = obstacles.some(obstacle => {
                return obstacle.isCollision(this.x, this.y);
            });

        } while (collision);

    }

    draw(ctx) {

        // Draw apple
        ctx.fillStyle = 'red';
        if (this.gold) {
            ctx.fillStyle = 'gold';
        }
        ctx.beginPath();
        ctx.arc(this.x * gridSize + 0.5 * (gridSize - 2), this.y * gridSize + 0.5 * (gridSize - 2), 0.4 * (gridSize - 2), 0, 2 * Math.PI);
        ctx.fill();

        // Draw stem
        ctx.fillStyle = 'brown';
        ctx.fillRect(this.x * gridSize + 7, this.y * gridSize, 4, 0.5 * (gridSize - 2));

        // Draw leaf
        ctx.fillStyle = 'green';
        ctx.beginPath();
        ctx.moveTo(this.x * gridSize + 9, this.y * gridSize);
        ctx.lineTo(this.x * gridSize + 9, this.y * gridSize + 4);
        ctx.lineTo(this.x * gridSize + 18, this.y * gridSize + 2);
        ctx.fill();

    }

    get position() {
        return {
            x: this.x,
            y: this.y
        };
    }

}            