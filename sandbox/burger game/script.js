// JavaScript
//===================================================////======================================//
//================== INITIALIZATION =================////======================================//
//===================================================////======================================//

//---------- HTML ELEMENTS ----------//
var ctrlInfo = document.getElementById('ctrlInfoFrame');
var stackContainer = document.getElementById('stackContainer');
var stackBase = document.getElementById('stackBase');
var gameInfo = document.getElementById('gameInfo');
var theButton = document.getElementById('theButton');

var baseHeight = parseInt(window.getComputedStyle(stackBase, null).getPropertyValue('height'));
var baseBottom = parseInt(window.getComputedStyle(stackBase, null).getPropertyValue('bottom'));

//---------- ARRAYS ----------//
var demoSeq = []; //---------- Randomly generated
var playerSeq = []; //---------- Sequence of player input
var demoStack = []; //---------- Array to hold the visible stack ----------/
var playerStack = []; //----------//----------//----------//----------//----/

//---------- TOGGLES ----------//
var levelClear = false;
var inputAllowed = false;

//---------- GAME SETTINGS ----------//
var prevSliceHeight = baseHeight;
var prevSliceBottom = baseBottom;
var animDelay = 0.5; //---------- Number of delay (in seconds) for each slice to pop up
var stackSize = 3; //---------- Number of slice in the initial stack
var MAX_STACK_SIZE = 12; //---------- Number of max slices in the stack
var demoDelayTime = 3000; //---------- Number of time in milli second before hiding the demo slices

//===================================================////======================================//
//================== EVENT HANDLERS =================////======================================//
//===================================================////======================================//

window.addEventListener('keyup', function (evt) {
    if (inputAllowed) //---------- This is to prevent rapid keypress causing slices to spawn too close to one another (ref: 261, 321, 326, 359)
    {
        switch (evt.keyCode) {
            case 49:
                spawnSlice(1);
                break;

            case 50:
                spawnSlice(2);
                break;

            case 51:
                spawnSlice(3);
                break;

            case 52:
                spawnSlice(4);
                break;
        }
    }
});


// get event from mouse click
for (var i = 0; i < 4; i++) {
    document.getElementsByClassName('keyGuides')[i]
        .addEventListener('click', function (event) {
            if (inputAllowed) {
                var clickedId = parseInt(event.target.getAttribute('data-value'));
                spawnSlice(clickedId);
            }
        });
}







//===================================================////===================================//
//==================== FUNCTIONS ====================////===================================//
//===================================================////===================================//

function clearContent() {
    for (i = 1; i < demoStack.length; i++) {
        stackContainer.removeChild(demoStack[i]);
    }

    for (i = 1; i < playerStack.length; i++) {
        stackContainer.removeChild(playerStack[i]);
    }

    demoStack = [stackBase]; //---------- Putting the base in demoStack[] and playerStack[]
    playerStack = [stackBase];

    prevSliceHeight = baseHeight;
    prevSliceBottom = baseBottom;

    levelClear = false;
}

function sliceById(id) { //---------- This function has a return value
    switch (id) {
        case 0:
            return {
                type: 'stackCap',
                height: 45
            };

        case 1:
            return {
                type: 'beef',
                height: 20
            };

        case 2:
            return {
                type: 'lettuce',
                height: 24
            };

        case 3:
            return {
                type: 'cheese',
                height: 12
            };

        case 4:
            return {
                type: 'onion',
                height: 16
            };
    }
}


function generateSliceById(id) {
    var sliceInstance = document.createElement('div'); // Create div element

    sliceInstance.classList.add(sliceById(id).type);
    sliceInstance.style.bottom = (prevSliceBottom + prevSliceHeight) + 'px';

    prevSliceBottom = prevSliceBottom + prevSliceHeight;
    prevSliceHeight = sliceById(id).height;

    sliceInstance.classList.add('popIn');

    return sliceInstance;
}


function spawnSlice(id) {
    var newSlice = generateSliceById(id); //---------- Create element

    stackContainer.appendChild(newSlice); //---------- Make it visible
    playerStack.push(newSlice); //---------- Update playerStack array

    playerSeq.push(id);

    checkAnswer();
}

function checkAnswer() {
    if (playerSeq.length <= demoSeq.length) {

        // if last player input is equal to demoSeq at the same index, then match
        if (playerSeq[playerSeq.length - 1] == demoSeq[playerSeq.length - 1]) {
            if (playerSeq.length == demoSeq.length) {
                levelClear = true;

                spawnSlice(0); //--------- spawn the stackCap
                gameOver();
            }
        } else {
            gameOver();
        }
    }
}

function gameOver() {
    inputAllowed = false;

    if (levelClear && stackSize <= MAX_STACK_SIZE) {
        // Level clear

        if (stackSize < MAX_STACK_SIZE) {
            stackSize++;
        } else {
            // if max level then decrease delay speed to make the burger's slice appear quicker
            if (animDelay > 0.15) {
                animDelay -= 0.05;
            }
        }

        theButton.innerHTML = 'Next Level';
        theButton.style.display = 'flex';
        theButton.style.background = 'rgba(34, 139, 34, 0.6)';
        theButton.onclick = function () {
            startDemo();
        };

        if (stackSize < 10) //----------//---------- Customize level-cleared screen
        {
            gameInfo.innerHTML = '===== Level Cleared =====<br/><br/>Awesome, but can you beat the next Level?';
        } else {
            gameInfo.innerHTML = '===== Level Cleared =====<br/><br/>Nice brain you have there, how much further can you go?';
        }
    } else {
        // Game over
        theButton.innerHTML = 'Try Again';
        theButton.style.display = 'flex';
        theButton.style.background = 'rgba(128, 0, 0, 0.6)';
        theButton.onclick = function () {
            startDemo();
        };

        gameInfo.innerHTML = '===== GAME OVER =====<br/><br/>You got it wrong!<br/>The correct sequence is: <br/>< ';

        for (i = 0; i < demoSeq.length - 1; i++) {
            gameInfo.innerHTML += demoSeq[i] + ' . ';
        }

        gameInfo.innerHTML += demoSeq[demoSeq.length - 1] + ' >';
    }
}




//===================================================////==================================//
//==================== GAME FLOW ====================////==================================//
//===================================================////==================================//

function startDemo() {
    theButton.style.display = 'none';
    ctrlInfo.style.bottom = '-50px';
    gameInfo.innerHTML = 'Watch closely...';

    demoSeq = [];
    playerSeq = [];
    levelClear = false;

    clearContent();


    stackBase.classList.add('popIn');

    //----------- Start random pieces
    if (demoStack.length < stackSize) {

        // --------- Reset height and bottom to stackBase slice
        prevSliceHeight = baseHeight;
        prevSliceBottom = baseBottom;

        for (i = 0; i <= stackSize; i++) {

            //var sliceInstance = document.createElement("div");
            var newSlice;

            var dice = Math.round(Math.random() * 4) + 1;
            if (dice == 5) {
                dice = 1;
            }

            if (i == stackSize) {
                newSlice = generateSliceById(0);    //---------- Create stack cap
            } else {
                demoSeq.push(dice);
                newSlice = generateSliceById(dice);
            }

            newSlice.style.animationDelay = ((animDelay * i) + animDelay) + 's';

            stackContainer.appendChild(newSlice); //---------- Make it visible in window
            demoStack.push(newSlice); //----------//---------- Add it to the demoStack array
        }
    }

    updateDemo();
}

//===================================================////================================//
//===================================================////================================//
//===================================================////================================//

function updateDemo() {
    setTimeout(exitDemo, (demoSeq.length * animDelay * 1500) + 2000); //---------- Hide demo stack after some time

    function exitDemo() {
        for (i = 1; i < demoStack.length; i++) {
            demoStack[i].classList.add('popOut');
            demoStack[i].classList.remove('popIn');
        }

        demoStack[demoStack.length - 1].addEventListener('animationend', function () {
            gameInfo.innerHTML = 'Now use the 1 ~ 4 keys on your keyboard to recreate the burger, good luck!';
            clearContent();

            startPlay();
        });
    }
}


//===================================================////================================//
//===================================================////================================//
//===================================================////================================//

function startPlay() {
    playerSeq = [];

    ctrlInfo.classList.add('guidesAnim'); //---------- Apply CSS animation
    ctrlInfo.addEventListener('animationend', function () {
        ctrlInfo.style.bottom = window.getComputedStyle(ctrlInfo, null).getPropertyValue('bottom');
        ctrlInfo.classList.remove('guidesAnim');
        inputAllowed = true; //---------- Enable user input
    });
}


startDemo();