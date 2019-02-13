//  JavaScript
var playPause = document.querySelector('#playPause');
var pong = document.querySelector('#pong');
var playerPad = document.querySelector('#playerPad');
var aiPad = document.querySelector('#aiPad');
var ball = document.querySelector('#ball');

var playerScore = document.querySelector('#playerScore');
var aiScore = document.querySelector('#aiScore');

var ballTop = 140;
var ballLeft = 240;
var ballSpeed = 10;
var ballSpeedX = 0;
var ballSpeedY = 0;
var maxSpeed = 15;

var aiError = 40;
var aiTurn = true;

var startDir = 1;
var lostBall = false;

var minLeft = playerPad.offsetLeft + playerPad.offsetWidth;
var maxLeft = aiPad.offsetLeft - ball.offsetWidth;

var maxFPS = 30;
var frameInterval = 1000 / maxFPS;
var timePrevFrame = Date.now();

window.onkeypress = render;
window.onmousemove = updatePlayerPadPosition;
playPause.onclick = playOrPause;

render();

function render() {
    var timeThisFrame = Date.now();
    var elapsed = timeThisFrame - timePrevFrame;
    
    if (elapsed > frameInterval) {
        timePrevFrame = timeThisFrame - (elapsed % frameInterval);
        
        if (playPause.innerText == 'PAUSE') {
            requestAnimationFrame(animatePong);
        }
    }
    
    requestAnimationFrame(render);
}

function animatePong() {
    ballLeft += ballSpeedX;
    ballTop += ballSpeedY;
    
    checkLoss();
    updateAiPadPosition();
    checkWallRebound();
    checkPadRebound();
    
    ball.style.left = ballLeft + "px";
    ball.style.top = ballTop + "px";
}

function checkLoss() {
    if (ballLeft + ball.offsetWidth < 0) {
        var currentScore = Number(aiScore.innerText);

        aiScore.innerText = currentScore + 1;
        aiError /= 0.9;
        resetPong();
    }
    else if (ballLeft > pong.offsetWidth) {
        var currentScore = Number(playerScore.innerText);

        playerScore.innerText = currentScore + 1;
        aiError *= 0.9;
        resetPong();
    }
}

function resetPong() {
    ballTop = 140;
    ballLeft = 240;
    ballSpeedX = 0;
    ballSpeedY = 0;
    lostBall = false;

    playPause.innerText = "PLAY";
}

function updateAiPadPosition() {
    if (aiTurn) {
        //  determine whether ball has moved pass 80% across its container
        var inRange = ballLeft > pong.offsetWidth * 0.8;

        if (inRange) {
            var maxTop = pong.offsetHeight - aiPad.offsetHeight;
            var distance = aiPad.offsetLeft - ballLeft - ball.offsetWidth;
            var eta = distance / ballSpeedX;
            var estimate = ballTop + ballSpeedY * eta;
            var padTop = estimate - aiPad.offsetHeight / 2;

            padTop = padTop + randomRange(aiError, -aiError);
            padTop = Math.max(padTop, 0);
            padTop = Math.min(padTop, maxTop);
    
            aiPad.style.top = padTop + 'px';
            aiTurn = false;

            console.log(`AI moves to ${padTop}px.`);
        }
    }
}

function checkWallRebound() {
    var maxTop = pong.offsetHeight - ball.offsetHeight;

    //  check whether top position of the ball is beyond the top or bottom boundaries
    if (ballTop <= 0 || ballTop >= maxTop) {
        randomiseSpeed();
        //  reverse vertical movement
        ballSpeedY *= -1;
        //  check whether ball is beyond the top boundary
        ballTop = Math.max(ballTop, 0);
        //  check whether ball is beyond the bottom boundary
        ballTop = Math.min(ballTop, maxTop);
    }
}

function randomiseSpeed() {
    var hDir = ballSpeedX / Math.abs(ballSpeedX);
    var vDir = ballSpeedY / Math.abs(ballSpeedY);

    //  apply random modifier to horizontal speed of the ball
    ballSpeedX *= randomRange(0.9, 1.1);
    //  clamp the horizontal speed to no smaller than half the overalll speed
    ballSpeedX = hDir * Math.max(ballSpeedX, ballSpeed / 2);
    //  adjust the vertical speed to maintain overall speed
    ballSpeedY = vDir * Math.sqrt(ballSpeed ** 2 - ballSpeedX ** 2);
}

function checkPadRebound() {
    //  check whether ball has moved passed the player pad
    if (ballLeft <= minLeft) {
        checkPadCollision(playerPad);
    }
    //  check whether ball has moved passed the AI pad
    else if (ballLeft >= maxLeft) {
        checkPadCollision(aiPad);
    }
}

function checkPadCollision(pad) {
    var lowerTop = pad.offsetTop - ball.offsetHeight;
    var upperTop = pad.offsetTop + pad.offsetHeight;
    var contact = ballTop >= lowerTop && ballTop <= upperTop;
    //  determine whether player caught the ball
    var playerCatch = pad == playerPad && ballLeft >= pad.offsetLeft;
    //  determine whether AI caught the ball
    var aiCatch = pad == aiPad && ballLeft + ball.offsetWidth <= pad.offsetLeft + pad.offsetWidth;
    var validCatch = playerCatch || aiCatch;

    //  check whether ball has moved beyond and colliding with a specified pad
    if (lostBall && contact) {
        randomiseSpeed();
        //  reverse vertical movement
        ballSpeedY *= -1;
        lostBall = false;
    }
    //  check whether ball is colliding with a specified pad
    else if (contact && validCatch) {
        randomiseSpeed();
        //  reverse horizontal movement
        ballSpeedX *= -1;

        console.log(ballLeft, minLeft, maxLeft);

        if (playerCatch) {
            //  increase ball movement
            ballSpeed += 0.1;
            //  clamp at maximum speed
            ballSpeed = Math.min(ballSpeed, maxSpeed);
            aiTurn = true;
            ballLeft = minLeft;
        }
        else if (aiCatch) {
            ballLeft = maxLeft;
        }
    }
    else {
        lostBall = pad;
    }
}

function updatePlayerPadPosition() {
    if (playPause.innerText == 'PAUSE') {
        var containerTop = pong.offsetTop + game.offsetTop;
        var cursorTop = event.clientY - containerTop - playerPad.offsetHeight / 2;
        var maxTop = pong.offsetHeight - playerPad.offsetHeight;
        var padTop = Math.max(cursorTop, 0);
        
        padTop = Math.min(padTop, maxTop);

        playerPad.style.top = padTop + "px";
    }
}

function playOrPause() {
    if (playPause.innerText == 'PLAY') {
        playPause.innerText = 'PAUSE';

        //  check whether speed is zero
        if (ballSpeedX + ballSpeedY == 0) {
            //  check whether a random number is greater than 0.5
            if (Math.random() > 0.5) {
                //  negate the direction value
                startDir *= -1;
            }
            
            aiTurn = Boolean(startDir);

            ballSpeedX = startDir * randomRange(0.5, 0.8) * ballSpeed;
            ballSpeedY = -Math.sqrt(ballSpeed ** 2 - ballSpeedX ** 2);
        }
    }
    else {
        playPause.innerText = 'PLAY';
    }
}

// ========== //
// ========== //
// ========== //

function randomRange(min, max, int = false) {
    const r = Math.random() * (max - min) + min;
    return int ? Math.round(r) : r;
}

window.onload = window.onresize = resize;

function resize() {
  var gameRatio = game.offsetWidth / game.offsetHeight;
  var windowRatio = window.innerWidth / window.innerHeight;
  
  game.style.left = `${(window.innerWidth - game.offsetWidth) / 2}px`;
  game.style.top = `${(window.innerHeight - game.offsetHeight) / 2}px`;
//   game.style.transform = `scale(${gameRatio > windowRatio ? window.innerWidth / game.offsetWidth : window.innerHeight / game.offsetHeight})`;
}