//====================================================================== DECLARATION ==========//
var gameArea = document.querySelector("#gameArea");
var playerSprite = document.querySelector("#playerSprite");
var keyState = {};

var powerUpSprite = [];
var asteroidArray = [];
var asteroidSpeed = [];
var asteroidOffset = [];

var gameScore = 0;
var powerUp = 1;

var playerStatus = 1;
var playerSpeed = 2;
var hitPoint = 100;
var diffInc = 0;
var asteroidCount = 1;
var asteroidCountMax = 20;

var diffCap = false;

//====================================================================== INITIALIZATION ==========//
playerSprite.style.left = (parseInt(window.getComputedStyle(gameArea, null).getPropertyValue("width")) / 2) - (parseInt(window.getComputedStyle(playerSprite, null).getPropertyValue("width")) / 2) + "px";
playerSprite.style.bottom = "50px";


gameUpdate();

window.addEventListener('keydown', function(e) {
		keyState[e.keyCode || e.which] = true;
}, true);

window.addEventListener('keyup', function(e) {
		keyState[e.keyCode || e.which] = false;
}, true);

function checkCollision(targetObj) {
	var targetObjCOG = [parseInt(targetObj.style.left) + parseInt(targetObj.style.width) / 2, parseInt(targetObj.style.top) + parseInt(targetObj.style.width) / 2];
	var distance = [targetObjCOG[0] - this[0], targetObjCOG[1] - this[1]];
	
	return Math.sqrt(Math.pow(distance[0], 2) + Math.pow(distance[1], 2)).toFixed(2) < ((parseInt(targetObj.style.width) / 2) + this[2]);
}

function gameUpdate() {
	//===================================//
	//============== HUD ================//
	//===================================//

	document.querySelector("#info").innerHTML = "HP: " + hitPoint + "</br>Score: " + gameScore;
	
	//===================================//
	//============= PLAYER ==============//
	//===================================//
	
	//====================================================================== GAME OVER ==========//
	if (hitPoint <= 0) {
		hitPoint = 0;
		gameUpdate.clearTimeout();
		gameOver;
	}

	//====================================================================== UPDATE POSITION ==========//
	if (playerStatus == 1) {
		var playerPosH = parseInt(window.getComputedStyle(playerSprite, null).getPropertyValue("left"));
		var playerPosV = parseInt(window.getComputedStyle(playerSprite, null).getPropertyValue("bottom"));
		var gameAreaHeight = parseInt(window.getComputedStyle(gameArea, null).getPropertyValue("height"));
		var gameAreaWidth = parseInt(window.getComputedStyle(gameArea, null).getPropertyValue("width"));
		var playerSpriteWidth = parseInt(window.getComputedStyle(playerSprite, null).getPropertyValue("width"));
		var playerSpriteHeight = parseInt(window.getComputedStyle(playerSprite, null).getPropertyValue("height"));
		
		// 'left arrow' or 'A'
		if (keyState[37] || keyState[65] && playerPosH > 0) {
			playerPosH -= playerSpeed;
		}
		
		// 'right arrow' or 'D'
		if (keyState[39] || keyState[68] && playerPosH < gameAreaWidth - playerSpriteWidth) {
			playerPosH += playerSpeed;
		}
		
		// 'down arrow' or 'S'
		if (keyState[40] || keyState[83] && playerPosV > 0) {
			playerPosV -= playerSpeed;
		}
		
		// 'up arrow' or 'W'
		if (keyState[38] || keyState[87] && playerPosV < gameAreaHeight - playerSpriteHeight) {
			playerPosV += playerSpeed;
		}

		// redraw/reposition player sprite
		playerSprite.style.left = playerPosH + "px";
		playerSprite.style.bottom = playerPosV + "px";

		//====================================================================== COLLISION DECTECTION ==========//
		var playerCOG = [playerPosH + (playerSpriteWidth / 2), gameAreaHeight - (playerPosV + (playerSpriteHeight / 2)), playerSpriteWidth / 2];


		if (asteroidArray.find(checkCollision, playerCOG) != undefined && asteroidArray[asteroidArray.findIndex(checkCollision, playerCOG)].style.opacity > 0) {
			hitPoint -= Math.round(parseInt(asteroidArray[asteroidArray.findIndex(checkCollision, playerCOG)].style.width) / 2);
			asteroidArray[asteroidArray.findIndex(checkCollision, playerCOG)].style.opacity = 0;
		}

		if (powerUpSprite.find(checkCollision, playerCOG) != undefined && powerUpSprite[0].style.opacity > 0) {
			hitPoint += 100;
			powerUpSprite[0].style.opacity = 0;
		}
	}

	//===================================//
	//=========== ASTEROIDS  ============//
	//===================================//
	
	//====================================================================== SPAWN ASTEROID ==========//
	if (Math.random() > 0.9 && asteroidArray.length < asteroidCount) {
		// initialize asteroid properties
		var minWidth = 25;
		var maxWidth = 60;
		var minSpeed = 0.5 + diffInc / 10;
		var maxSpeed = 2 + diffInc;
		
		var spriteInstance = document.createElement("img");
		var instanceWidth = Math.floor(Math.random() * (maxWidth - minWidth + 1)) + minWidth;
		var instancePos = Math.floor(Math.random() * (parseFloat(window.getComputedStyle(gameArea, null).getPropertyValue("width")) - instanceWidth + 1));
		var instanceSpeed = Math.random() * (maxSpeed - minSpeed + 1) + minSpeed;				
		var instanceOffset = instanceSpeed * ((Math.random() * 0.3) - 0.15);

		// assign values
		spriteInstance.id = "asteroid_" + asteroidArray.length;
		spriteInstance.src = "img/asteroidSprite.png";
		spriteInstance.style.position = "absolute";
		spriteInstance.style.width = instanceWidth + "px";
		spriteInstance.style.top = "-50px";
		spriteInstance.style.left = instancePos + "px";
		spriteInstance.style.opacity = 1;

		// update array
		gameArea.appendChild(spriteInstance);
		asteroidArray.push(spriteInstance);
		asteroidSpeed.push(instanceSpeed);
		asteroidOffset.push(instanceOffset);

		// toggle difficulty modifier
		if (maxSpeed >= 8) {
			diffCap = true;
		}
	}
	
	//====================================================================== ANIMATE ASTEROIDS ==========//
	if (asteroidArray.length > 0) {
		for (i = 0; i < asteroidArray.length; i++) {
			// redraw asteroid
			asteroidArray[i].style.top = parseFloat(asteroidArray[i].style.top) + asteroidSpeed[i] + "px";
			asteroidArray[i].style.left = parseFloat(asteroidArray[i].style.left) + asteroidOffset[i] + "px";

			// check for removal
			if (parseFloat(asteroidArray[i].style.top) > parseFloat(window.getComputedStyle(gameArea, null).getPropertyValue("height")) ||
				parseFloat(asteroidArray[i].style.left) > parseFloat(window.getComputedStyle(gameArea, null).getPropertyValue("width")) ||
				parseFloat(asteroidArray[i].style.left) < -parseFloat(asteroidArray[i].style.width)) {

				// update game score
				gameScore += parseInt(asteroidArray[i].style.width);
				
				// update array
				gameArea.removeChild(asteroidArray[i]);
				asteroidArray.splice(i, 1);
				asteroidSpeed.splice(i, 1);
				asteroidOffset.splice(i, 1);
				
				// update difficulty modifier
				if (diffCap == false) {
					diffInc += 0.01;
				} else {
					diffInc += 0.002;
				}

				// increase total asteroid count
				if (asteroidCount < asteroidCountMax) {
					if (asteroidArray.length < 10) {
						asteroidCount += 1;
					} else {
						asteroidCount = 10 + diffInc;
					}					
				}

				// increase player speed
				if (playerSpeed < 3.5) {
					playerSpeed += 0.005;					
				}				
			}
		}
	}

	//===================================//
	//============ POWER-UP =============//
	//===================================//
	
	//====================================================================== SPAWN POWER-UP ==========//
	
	if (gameScore / powerUp > 10000 && powerUpSprite.length < 1) {
		var spriteInstance = document.createElement("img");
	
		// assign values
		spriteInstance.id = "powerUp";
		spriteInstance.src = "img/powerUp.png";
		spriteInstance.style.position = "absolute";
		spriteInstance.style.width = "50px";
		spriteInstance.style.top = "-50px";
		spriteInstance.style.left = Math.floor(Math.random() * (parseFloat(window.getComputedStyle(gameArea, null).getPropertyValue("width")) - 50 + 1)) + "px";
		spriteInstance.style.opacity = 1;

		// update array
		gameArea.appendChild(spriteInstance);
		powerUpSprite.push(spriteInstance);

		powerUp++;
	}
	
	//====================================================================== ANIMATE ASTEROIDS ==========//
	if (powerUpSprite.length > 0) {
		for (i = 0; i < powerUpSprite.length; i++){
			// redraw asteroid
			powerUpSprite[i].style.top = parseFloat(powerUpSprite[i].style.top) + 2 + "px";

			// check for removal
			if (parseFloat(powerUpSprite[i].style.top) > parseFloat(window.getComputedStyle(gameArea, null).getPropertyValue("height"))) {
				gameArea.removeChild(powerUpSprite[i]);
				powerUpSprite.splice(i, 1);
			}
		}
	}

	setTimeout(gameUpdate, 5);
}

function gameOver() {

}