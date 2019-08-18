
var gameWidth = 500;
var gameHeight = 400;

var padWidth = 10;
var padHeight = 80;
var playerPadX = 10;
var aiPadX = gameWidth - padWidth - playerPadX;

var ballSize = 15;
var ballX = (gameWidth - ballSize) / 2;
var ballY = (gameHeight - ballSize) / 2;

var maxSpeed = 15;
var speed = 10;
var speedX = 6;
var speedY = 8;

var aiError = 60;
var aiTurn;

var playing = false;
var paused = false;
var lostBall = false;

window.onload = initGame;

function initGame() {
    document.querySelectorAll('*').forEach(el => {
        el.setPosition = (x, y) => {
            el.style.left = `${x}px`;
            el.style.top = `${(y)}px`;
        };
        el.setSize = (w, h) => {
            el.style.width = `${w}px`;
            el.style.height = `${Number.isFinite(h) ? h : w}px`;
        }
    });

    var padStartingY = (gameHeight - padHeight) / 2;
    
    gameArea.setSize(gameWidth, gameHeight);
    playerPad.setSize(padWidth, padHeight);
    aiPad.setSize(padWidth, padHeight);
    ball.setSize(ballSize);

    playerPad.setPosition(playerPadX, padStartingY);
    aiPad.setPosition(aiPadX, padStartingY);
    ball.setPosition(ballX, ballY);

    playPause.onclick = startGame;
    gameArea.onmousemove = updatePlayerPad;
}

function startGame() {
    if (playing) {
        if (paused) {
            playPause.innerText = 'PAUSE';
        }
        else {
            playPause.innerText = 'RESUME';
        }
        paused = !paused;
    }
    else {
        playing = true;
        playPause.innerText = 'PAUSE';

        randomizeSpeed();
        randomizeDir();
        render();
    }   
}

function animatePong() {
    ballX += speedX;
    ballY += speedY;

    checkWallRebound();
    checkPadRebound();
    updateAiPad();
    checkLoss();

    ball.setPosition(ballX, ballY);
}

function updatePlayerPad() {
    if (playing && !paused) {
        var mouseY = event.offsetY;

        if (mouseY > 0 && mouseY < gameHeight) {
            var playerPadY = mouseY - padHeight / 2;
            playerPadY = Math.max(playerPadY, 5);
            playerPadY = Math.min(playerPadY, gameHeight - padHeight - 5);
            playerPad.setPosition(playerPadX, playerPadY);
        }
    }
}

function updateAiPad() {
    if (aiTurn) {
        //  determine whether ball has moved pass 80% across its container
        var inRange = ballX > gameWidth * 0.8;

        if (inRange) {
            var maxTop = gameHeight - padHeight;
            var distance = aiPadX - ballX - ballSize;
            var eta = distance / speedX;
            var estimate = ballY + speedY * eta;
            var aiPadY = estimate - padHeight / 2;

            aiPadY = aiPadY + randomRange(aiError, -aiError);
            aiPadY = Math.max(aiPadY, 5);
            aiPadY = Math.min(aiPadY, maxTop - 5);

            aiPad.setPosition(aiPadX, aiPadY);
            aiTurn = false;

            console.log(`AI moves to ${Math.round(aiPadY)}px.`);
        }
    }
}

function checkWallRebound() {
    var maxY = gameHeight - ballSize;

    if (ballY < 0 || ballY > maxY) {
        randomizeSpeed();
        speedY *= -1;
        ballY = ballY > 0 ? maxY : 0;
    }
}

function checkPadRebound() {
    //  check whether ball has moved passed the player pad
    if (ballX <= playerPadX + padWidth) {
        checkPadCollision(playerPad);
    }
    //  check whether ball has moved passed the AI pad
    else if (ballX >= aiPadX - ballSize) {
        checkPadCollision(aiPad);
    }
}

function checkLoss() {
    if (ballX <= -ballSize) {
        aiScore.innerText = parseInt(aiScore.innerText) + 1;
        aiError /= 0.9;
        resetGame();
    }
    else if (ballX >= gameWidth) {
        playerScore.innerText = parseInt(playerScore.innerText) + 1;
        aiError *= 0.9;
        resetGame();
    }
}

function resetGame() {
    ballX = (gameWidth - ballSize) / 2;
    ballY = (gameHeight - ballSize) / 2;

    playing = false;
    lostBall = false;

    playPause.innerText = 'PLAY';
}

function checkPadCollision(pad) {
    var lowerTop = pad.offsetTop - ballSize;
    var upperTop = pad.offsetTop + padHeight;
    var contact = ballY >= lowerTop && ballY <= upperTop;
    var ballRadius = ballSize / 2;
    //  determine whether contact if a valid catch
    var validCatch = ballY >= lowerTop + ballRadius && ballY <= upperTop - ballRadius;

    if (contact) {
        if (lostBall) {
            //  reverse vertical movement
            speedY *= -1;
        }
        else if (validCatch) {
            randomizeSpeed();
            //  reverse horizontal movement
            speedX *= -1;

            if (pad == playerPad) {
                //  increase ball movement speed
                speed += 0.2;
                //  clamp at maximum speed
                speed = Math.min(speed, maxSpeed);
                //  correct any clipping by the player pad
                ballX = playerPadX + padWidth;
                aiTurn = true;
            }
            else if (pad == aiPad) {
                //  correct any clipping by the AI pad
                ballX = aiPadX - ballSize;
            }
        }
    }
    else {
        lostBall = true;
    }
}

function randomizeSpeed() {
    //  store current vertical direction of the ball
    var xDir = speedX / Math.abs(speedX);
    var yDir = speedY / Math.abs(speedY);

    speedX = xDir * randomize(speed / 1.5, 30);
    speedY = yDir * Math.sqrt(speed ** 2 - speedX ** 2);
}

function randomizeDir() {
    var randomDir = n => n * (Math.random() >= 0.5 ? 1 : -1);
    speedX = randomDir(speedX);
    speedY = randomDir(speedY);
    aiTurn = speedX > 0;
}

var timePrevFrame = Date.now();

function render() {
    if (!playing) return;

    var timeThisFrame = Date.now();
    var elapsed = timeThisFrame - timePrevFrame;

    if (elapsed > 33) {
        timePrevFrame = timeThisFrame - (elapsed % 33);

        if (!paused) {
            requestAnimationFrame(animatePong);
        }
    }

    requestAnimationFrame(render);
}

function randomize(n, perc) {
    const sign = Math.random() >= 0.5 ? 1 : -1;
    const noise = n * Math.random() * perc / 100;
    return n + (noise * sign);
}

function randomRange(min, max, int = false) {
    const r = Math.random() * (max - min) + min;
    return int ? Math.round(r) : r;
}
