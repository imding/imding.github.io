// Enum describing the difficulty of the maps
let MapEnum = Object.freeze({"easy": 1, "medium": 2, "hard": 3});

// Define the function to be called when the window loads
window.onload = function() {
   	
  	// Set up the graphics
 	canv = document.getElementById("gc");
    ctx = canv.getContext("2d");
  
  	// Get HTML elements
    pointsLabel = document.getElementById("points");
  	difficultyLabel = document.getElementById("select-difficulty");
  	easyButton = document.getElementById("easy");
  	mediumButton = document.getElementById("medium");
  	hardButton = document.getElementById("hard");
  
  	// Add event listeners for the difficulty buttons
  	easyButton.addEventListener('click', function () {
      	window.gameDifficulty = MapEnum.easy;
      	startGame();
      	setButtonsVisibility('hidden');
    });
  	mediumButton.addEventListener('click', function () {
      	window.gameDifficulty = MapEnum.medium;
      	startGame();
      	setButtonsVisibility('hidden');
    });
  	hardButton.addEventListener('click', function () {
      	window.gameDifficulty = MapEnum.hard;
      	startGame();
      	setButtonsVisibility('hidden');
    });
  
  	// Add listener for key presses
    document.addEventListener("keydown", keyPush);
  
  	// Draw the opening screen
    drawStartingScreen();

};

// Function: hide/show difficulty buttons and label 
function setButtonsVisibility(visibility) {
  	difficultyLabel.style.visibility = visibility;
  	easyButton.style.visibility = visibility;
    mediumButton.style.visibility = visibility;
    hardButton.style.visibility = visibility;
}

// Velocity of Player
let xVelocity = 0;
let yVelocity = 0;

// Position of Player
let playerX = 10;
let playerY = 10;

// Position of "Apple"
let appleX = 15;
let appleY = 15;

// How big each grid is (px)
let gridSize = 20;
// How many grids are in the canvas
let tileCount = 20;

// Array containing the snake's tail coordinates
let trail = [];
// How long the tail is
let tail = 5;

// How many points the user has
let points = 0;

// If the player has started moving
let playerIsMoving = false;

// Function: starting the game (canvas starts to refresh)
function startGame() {
  	
  	// Randomize the location of the starting apple
  	moveApple();
  
  	// Start the graphics, at a 15 refreshes per second rate
  	window.refresher = setInterval(refreshGame, 1000 / 15);
  
}

// Function: resetting the game (if the player dies)
function resetGame() {

  	// Draw the starting snake screen
  	drawStartingScreen();
  
  	// Make the buttons visible again
  	setButtonsVisibility('visible');
  
  	// Reset all stats
  	xVelocity = 0;
  	yVelocity = 0;
  	
  	playerX = 10;
  	playerY = 10;
 	
  	// Randomize the apple's position
  	moveApple();
  	
  	trail = [];
  	tail = 5;
  	
  	points = 0;
  
  	playerIsMoving = false;
  
  	updatePointsLabel();
}

// Function: handles the playing-losing event
function playerLoses() {
  	
  	// Stop the canvas from refreshing
    clearInterval(window.refresher);
  
  	// Draw the screen showing the "L" snake
  	drawLosingScreen();
  
  	// Wait 3 seconds, and then reset the game
  	setTimeout(resetGame, 3000);
  	
}

// Function: called 15 times a second to refresh the canvas
function refreshGame() {

    // Move the snake in the desired direction
    playerX += xVelocity;
    playerY += yVelocity;

    // Allow for horizontal wrapping
    if (playerX < 0) { // Wrapping from left
        playerX = tileCount - 1;
    } else if (playerX > tileCount - 1) { // Wrapping from right
        playerX = 0;
    }

    // Allow for vertical wrapping
    if (playerY < 0) { // Wrapping from bottom
        playerY = tileCount - 1;
    } else if (playerY > tileCount - 1) { // Wrapping from top
        playerY = 0;
    }
	
  	// Draw the graphics
  	drawScene();
  
    // If the player is still alive, add their current position to their tail
    trail.push({
        x: playerX,
        y: playerY
    });

    // Delete oldest element of the tail (at the beginning of the tail) so that the tail "moves"
    while (trail.length > tail) {
        trail.shift();
    }
  
    // If the player catches the apple
    if (playerX === appleX && playerY === appleY) {
        tail++;
        points++;
        updatePointsLabel();

        // Give the apple a new position
        moveApple();
    }
  
}

// Function: determining random (valid) coordinates for the apple
function moveApple() {
  	
  	// Determine a random set of coordinates for the apple between
  	// [0, 0] and [19, 19]
    appleX = Math.floor(Math.random() * tileCount);
    appleY = Math.floor(Math.random() * tileCount);
  	
  	// If the apple spawned in one of the obstacles, move it again
  	if (window.gameDifficulty === MapEnum.medium) {
      	if ( ((appleX > 2 && appleX < 8) || (appleX > 11 && appleX < 17)) && appleY > 8 && appleY < 11 ) {
        	moveApple();
        }
    } else if (window.gameDifficulty === MapEnum.hard) {
      	if ( (appleX === 6 || appleX === 13) && appleY > 3 && appleY < 16 ) {
          	moveApple();
        }
    }
  
}

// Function: called by 'refreshGame', responsible for the graphics
function drawScene() {

    // Draw canvas background
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canv.width, canv.height);

  	// Draw obstacles, if necessary
  	if (window.gameDifficulty === MapEnum.medium || window.gameDifficulty === MapEnum.hard) {
      	if (drawObstacles() === false) { // If the draw wasn't successful because the player died
          	return;
        }
    }
    
  	// Draw apple on canvas
    drawApple();
	
    // Draw snake on canvas
    ctx.fillStyle = "green";
    for (var i = 0; i < trail.length; i++) {
       	
      	// If we are on the "head" of the snake
      	if (i === trail.length - 1) {
          	ctx.fillRect(trail[i].x * gridSize, trail[i].y * gridSize, gridSize - 2, gridSize - 2);  
          	drawSnakeEyes();
        } else if (i === 0 && playerIsMoving) { // If we are on the "tail" of the snake
            drawSnakeTail();
        } else { // If we are on the "body" of the snake
          	ctx.fillRect(trail[i].x * gridSize, trail[i].y * gridSize, gridSize - 2, gridSize - 2);
        }
      
        // If the player runs into themselves (after the game starts), thus losing
        if (trail[i].x === playerX && trail[i].y === playerY && playerIsMoving) {
           	playerLoses();
          	break;
        }
    }

}

function updatePointsLabel() {
    pointsLabel.innerHTML = "Points: " + String(points);
}

function keyPush(event) {
    switch (event.keyCode) {
        case 37: // Left
            event.preventDefault(); // Prevent arrow keys from scrolling
        	if (xVelocity != 1) { // Prevent Right to Left switch
                xVelocity = -1;
                yVelocity = 0;
              	playerIsMoving = true;
            }
            break;
        case 38: // Down
        	event.preventDefault(); // Prevent arrow keys from scrolling
            if (yVelocity != 1) { // Prevent Up to Down switch
                xVelocity = 0;
                yVelocity = -1;
              	playerIsMoving = true;
            }
            break;
        case 39: // Right
        	event.preventDefault(); // Prevent arrow keys from scrolling
            if (xVelocity != -1) { // Prevent Left to Right Switch
                xVelocity = 1;
                yVelocity = 0;
              	playerIsMoving = true;
            }
            break;
        case 40: // Up
        	event.preventDefault(); // Prevent arrow keys from scrolling
            if (yVelocity != -1) { // Prevent Down to Up Switch
                xVelocity = 0;
                yVelocity = 1;
              	playerIsMoving = true;
            }
            break;
    }
}

function drawObstacles() {
  	
  	// Change to brown color
  	ctx.fillStyle = "#8B4513";
  
  	if (window.gameDifficulty === MapEnum.medium) {
      
      	for (var i = 0; i < 5; i++) {
          
          	for (var j = 0; j < 2; j++) {
              	
              	// If the snake runs into the boxes
              	if ((3 + i === playerX || 12 + i === playerX) && 9 + j === playerY && playerIsMoving) {
           			playerLoses();
          			return false;
        		}
              
              	ctx.fillRect(3 * gridSize + i * gridSize, 9 * gridSize + j * gridSize, gridSize - 2, gridSize - 2);
      			ctx.fillRect(12 * gridSize + i * gridSize, 9 * gridSize + j * gridSize, gridSize - 2, gridSize - 2);
              
            }
          
        }
      
    } else if (window.gameDifficulty === MapEnum.hard) {
      
      	for (var i = 0; i < 12; i++) {
          
          	// If the snake runs into the boxes
            if ((6 === playerX || 13 === playerX) && 4 + i === playerY && playerIsMoving) {
           		playerLoses();
          		return false;
        	}
              
            ctx.fillRect(6 * gridSize, 4 * gridSize + i * gridSize, gridSize - 2, gridSize - 2);
      		ctx.fillRect(13 * gridSize, 4 * gridSize + i * gridSize, gridSize - 2, gridSize - 2);
          
        }
      
    }
  		
}

function drawApple() {
  	
  	// Draw apple
    ctx.fillStyle = "red";
    ctx.beginPath();
    ctx.arc(appleX * gridSize + 0.5 * (gridSize - 2), appleY * gridSize + 0.5 * (gridSize - 2), 0.4 * (gridSize - 2), 0, 2 * Math.PI);
    ctx.fill();
  
  	// Draw stem
  	ctx.fillStyle = "brown";
  	ctx.fillRect(appleX * gridSize + 7, appleY * gridSize, 4, 0.5 * (gridSize - 2));
  
  	// Draw leaf
  	ctx.fillStyle = "green";
  	ctx.beginPath();
  	ctx.moveTo(appleX * gridSize + 9, appleY * gridSize);
  	ctx.lineTo(appleX * gridSize + 9, appleY * gridSize + 4);
  	ctx.lineTo(appleX * gridSize + 18, appleY * gridSize + 2);
  	ctx.fill();
  
}

function drawSnakeTail() {
  
  	// Get the coordinates of the tail
  	let tailX = trail[0].x;
  	let tailY = trail[0].y;
  
  	// Get the coordinates of the block just before the tail
  	let preTailX = trail[1].x;
  	let preTailY = trail[1].y;
  
  	// Get the direction that the tail is moving in
  	let tailXVelocity = preTailX - tailX;
  	let tailYVelocity = preTailY - tailY;
  
  	switch (tailXVelocity) {
      	case 1:
        	ctx.beginPath();
        	ctx.moveTo(tailX * gridSize + 18, tailY * gridSize);
        	ctx.lineTo(tailX * gridSize + 18, tailY * gridSize + 18);
        	ctx.lineTo(tailX * gridSize, tailY * gridSize + 9);
        	ctx.fill();
        	break;
        case -1:
        	ctx.beginPath();
        	ctx.moveTo(tailX * gridSize, tailY * gridSize);
        	ctx.lineTo(tailX * gridSize, tailY * gridSize + 18);
        	ctx.lineTo(tailX * gridSize + 18, tailY * gridSize + 9);
        	ctx.fill();
        	break;
      	case 0:
			switch (tailYVelocity) {
              	case 1:
                	ctx.beginPath();
        			ctx.moveTo(tailX * gridSize, tailY * gridSize + 18);
        			ctx.lineTo(tailX * gridSize + 18, tailY * gridSize + 18);
        			ctx.lineTo(tailX * gridSize + 9, tailY * gridSize);
        			ctx.fill();
        			break;
              	case -1:
                	ctx.beginPath();
        			ctx.moveTo(tailX * gridSize, tailY * gridSize);
        			ctx.lineTo(tailX * gridSize + 18, tailY * gridSize);
        			ctx.lineTo(tailX * gridSize + 9, tailY * gridSize + 18);
        			ctx.fill();
        			break;
            }
    }
  
}

function drawSnakeEyes() {
  
  	let i = trail.length - 1;	
  
  	// Giving the snake eyes based off of its direction
    switch (xVelocity) {
        case 1:
            ctx.fillStyle = "white";
            ctx.fillRect(trail[i].x * gridSize + 12, trail[i].y * gridSize + 3, 4, 4);
            ctx.fillRect(trail[i].x * gridSize + 12, trail[i].y * gridSize + 11, 4, 4);
            ctx.fillStyle = "green";
            break;
        case -1:
            ctx.fillStyle = "white";
            ctx.fillRect(trail[i].x * gridSize + 2, trail[i].y * gridSize + 3, 4, 4);
            ctx.fillRect(trail[i].x * gridSize + 2, trail[i].y * gridSize + 11, 4, 4);
            ctx.fillStyle = "green";
            break;
        case 0:
            switch (yVelocity) {
                case 1:
                    ctx.fillStyle = "white";
                    ctx.fillRect(trail[i].x * gridSize + 3, trail[i].y * gridSize + 12, 4, 4);
                	ctx.fillRect(trail[i].x * gridSize + 11, trail[i].y * gridSize + 12, 4, 4);
                	ctx.fillStyle = "green";
                    break;
                case -1:
                    ctx.fillStyle = "white";
                    ctx.fillRect(trail[i].x * gridSize + 3, trail[i].y * gridSize + 2, 4, 4);
                	ctx.fillRect(trail[i].x * gridSize + 11, trail[i].y * gridSize + 2, 4, 4);
                	ctx.fillStyle = "green";
                    break;
            }     
    }
}

function drawLosingScreen() {
  	
  	ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canv.width, canv.height);
  	
  	ctx.fillStyle = "green";
    ctx.fillRect(6 * gridSize, 3 * gridSize, 8 * gridSize, 14 * gridSize);
  
  	ctx.fillStyle = "black";
    ctx.fillRect(8 * gridSize, 3 * gridSize, 6 * gridSize, 12 * gridSize);
  
  	// Draw the triangle tail
    ctx.beginPath();
    ctx.moveTo(13 * gridSize, 15 * gridSize);
    ctx.lineTo(14 * gridSize, 16 * gridSize);
    ctx.lineTo(14 * gridSize, 15 * gridSize);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(13 * gridSize, 17 * gridSize);
    ctx.lineTo(14 * gridSize, 16 * gridSize);
    ctx.lineTo(14 * gridSize, 17 * gridSize);
    ctx.fill();
  
  	// Draw the eyes
    ctx.fillStyle = "white";
    ctx.fillRect(6 * gridSize + 1/3 * gridSize, 3 * gridSize + 1/3 * gridSize, 1/3 * gridSize, 1/3 * gridSize);
    ctx.fillRect(7 * gridSize + 1/3 * gridSize, 3 * gridSize + 1/3 * gridSize, 1/3 * gridSize, 1/3 * gridSize);
  
  	// Draw the tongue
    ctx.fillStyle = "pink";
    ctx.fillRect(6 * gridSize + 5/6 * gridSize, 2.5 * gridSize, 1/3 * gridSize, 1/2 * gridSize);
    ctx.beginPath();
    ctx.moveTo(7 * gridSize, 2.5 * gridSize);
  	ctx.lineTo(7 * gridSize, 2 * gridSize + 3/8 * gridSize);
  	ctx.lineTo(6.5 * gridSize, 2 * gridSize);
  	ctx.lineTo(6 * gridSize + 5/6 * gridSize, 2.5 * gridSize);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(7 * gridSize, 2.5 * gridSize);
  	ctx.lineTo(7 * gridSize, 2 * gridSize + 3/8 * gridSize);
  	ctx.lineTo(7.5 * gridSize, 2 * gridSize);
  	ctx.lineTo(7 * gridSize + 1/6 * gridSize, 2.5 * gridSize);
    ctx.fill();
  
}

function drawStartingScreen() {

    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canv.width, canv.height);

    ctx.fillStyle = "green";
    ctx.fillRect(6 * gridSize, 3 * gridSize, 8 * gridSize, 14 * gridSize);

    ctx.fillStyle = "black";
    ctx.fillRect(8 * gridSize, 5 * gridSize, 6 * gridSize, 4 * gridSize);
    ctx.fillRect(6 * gridSize, 11 * gridSize, 6 * gridSize, 4 * gridSize);

    // Draw the triangle tail
    ctx.beginPath();
    ctx.moveTo(7 * gridSize, 15 * gridSize);
    ctx.lineTo(6 * gridSize, 16 * gridSize);
    ctx.lineTo(6 * gridSize, 15 * gridSize);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(7 * gridSize, 17 * gridSize);
    ctx.lineTo(6 * gridSize, 16 * gridSize);
    ctx.lineTo(6 * gridSize, 17 * gridSize);
    ctx.fill();

    // Draw the eyes
    ctx.fillStyle = "white";
    ctx.fillRect(13 * gridSize + 1/3 * gridSize, 3 * gridSize + 1/3 * gridSize, 1/3 * gridSize, 1/3 * gridSize);
    ctx.fillRect(13 * gridSize + 1/3 * gridSize, 4 * gridSize + 1/3 * gridSize, 1/3 * gridSize, 1/3 * gridSize);

    // Draw the tongue
    ctx.fillStyle = "pink";
    ctx.fillRect(14 * gridSize, 3 * gridSize + 5/6 * gridSize, 1/2 * gridSize, 1/3 * gridSize);
    ctx.beginPath();
    ctx.moveTo(14.5 * gridSize, 4 * gridSize);
    ctx.lineTo(14 * gridSize + 5/8 * gridSize, 4 * gridSize);
    ctx.lineTo(15 * gridSize, 3.5 * gridSize);
    ctx.lineTo(14.5 * gridSize, 3 * gridSize + 5/6 * gridSize);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(14.5 * gridSize, 4 * gridSize);
    ctx.lineTo(14 * gridSize + 5/8 * gridSize, 4 * gridSize);
    ctx.lineTo(15 * gridSize, 4.5 * gridSize);
    ctx.lineTo(14.5 * gridSize, 4 * gridSize + 1/6 * gridSize);
    ctx.fill();

}