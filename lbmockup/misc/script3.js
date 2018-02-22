const links = [
  'http://bsdacademysandbox.com/curriculum/wp-content/uploads/2018/02/boxclosed.png',
  'http://bsdacademysandbox.com/curriculum/wp-content/uploads/2018/02/boxempty.png',
  'http://bsdacademysandbox.com/curriculum/wp-content/uploads/2018/02/boxprize.png'
];

var 
    boxes,
    prizeBox,
    selectedBox,
    autoPlay,
    // time between each automated click
    autoPlayDelay = 5,
    // amount of games to auto play
    autoPlayCount = 200,
    totalWin = 0,
    totalGames = 0,
    switched = false;

function initialize() {
    boxes = [box1, box2, box3];
    prizeBox = randomFrom(boxes);
    
    boxes.forEach(box => {
        box.onclick = function() {
            beginGameWith(this);
        };
    });
}

function beginGameWith(box) {
    // disable the onclick function of all three boxes
    disableChoice();

    // select this box
    selectBox(box);
    // update the content of the info element
    info.innerHTML = "We can reveal an empty box for you before opening the box of you choice.";
    
    // create and add a button element to the page
    const revealButton = document.createElement("button");
    
    revealButton.innerHTML = "REVEAL EMPTY BOX";
    document.body.appendChild(revealButton);
    
    // define the onclick event for the reveal button
    revealButton.onclick = function() {
        document.body.removeChild(this);

        // pick a box that is not the prize box nor the one selected by the player
        let emptyBox;
        
        do emptyBox = randomFrom(boxes);
        while (emptyBox == prizeBox || emptyBox == box);

        reveal(emptyBox);        
    };

    if (autoPlay) setTimeout(function() { revealButton.click() }, autoPlayDelay);
}

function disableChoice() {
    boxes.forEach(box => {
        box.onclick = null;
        box.style.cursor = "default";
    });
}

function selectBox(box) {
    if (selectedBox) selectedBox.className = "";
    
    // store the selected box in a variable
    selectedBox = box;
    // give a new class name to the selected box
    box.className = "selectedBox";
}

function reveal(box) {
    box.className = "emptyBox";
    box.style.backgroundImage = "url('" + links[1] + "')";
    info.innerHTML = box.id.toUpperCase().replace('BOX', 'BOX ') + " is empty. Now you have two options:";
    
    const
        // create two button elements
        stayButton = document.createElement("button"),
        switchButton = document.createElement("button"),
        // determine the other box that isn't the selected box nor the empty box
        theOtherBox = boxes.filter(b => (b != box && b != selectedBox))[0];
        
    stayButton.id = "stayButton";
    switchButton.id = "switchButton";

    // define the text on each button
    stayButton.innerHTML = "STAY WITH " + selectedBox.id.toUpperCase().replace("BOX", "BOX ");
    switchButton.innerHTML = "SWITCH TO " + theOtherBox.id.toUpperCase().replace("BOX", "BOX ");
    
    // add two buttons to the page
    document.body.appendChild(stayButton);
    document.body.appendChild(switchButton);
    
    [stayButton, switchButton].forEach(button => {
        button.onclick = function() {
            // remove the open & switch buttons from the page
            document.body.removeChild(stayButton);
            document.body.removeChild(switchButton);

            // select the other box if switch button is clicked
            if (button == switchButton) {
                selectBox(theOtherBox);
                // remember player choice for auto-play
                switched = true;
            } else {
                // remember player choice for auto-play
                switched = false;
            }

            openSelectedBox();
        };
    });

    if (autoPlay) setTimeout(function() { switched ? switchButton.click() : stayButton.click() }, autoPlayDelay);
}

function openSelectedBox() {
    info.innerHTML = "Click the OPEN button to find out if you picked the winning box!";
    
    // create a button element
    const openButton = document.createElement("button");
    
    openButton.id = "openButton";
    // define the text on that button
    openButton.innerHTML = "OPEN";
    // add the button to the page
    document.body.appendChild(openButton);
    
    openButton.onclick = function() {
        document.body.removeChild(this);
        check(selectedBox);
    };

    if (autoPlay) setTimeout(function() { openButton.click() }, autoPlayDelay);
}

function check(box) {
    // increase the total games played by 1
    totalGames++;
    box.className = '';
    
    if (box == prizeBox) {
        // increase number of wins by 1
        totalWin++;
        // set border colour to green
        box.style.backgroundImage = "url('" + links[2] + "')";
        info.innerHTML = "Congratulations! The box you opened contains the prize!";
    } else {
        // set border colour to red
        box.style.backgroundImage = "url('" + links[1] + "')";
        info.innerHTML = "The box you opened is empty, better luck next time.";
    }
    
    // display win rate
    tally.innerHTML = `You played <b>${totalGames}</b> game${totalGames > 1 ? 's' : ''}. Picked the prize box <b>${totalWin}</b> time${totalWin > 1 ? 's' : ''}. Your win rate is <b>${Math.round(totalWin * 1000 / totalGames) / 10}%</b>`;
    
    const
        playAgainButton = document.createElement("button"),
        repeatAction = document.createElement("button");
    
    playAgainButton.innerHTML = "PLAY AGAIN";
    repeatAction.innerHTML = "REPEAT " + autoPlayCount + " TIMES";

    document.body.appendChild(playAgainButton);
    document.body.appendChild(repeatAction);

    playAgainButton.onclick = function() {
        // remove the play again & repeat action buttons from the page
        document.body.removeChild(this);
        document.body.removeChild(repeatAction);

        // pick a new random prize box
        prizeBox = randomFrom(boxes);
        // clear the variable for selected box
        selectedBox = null;
        // display the correct information for a new games
        info.innerHTML = "Click to choose one box";
        
        boxes.forEach(box => {
            box.className = null;
            box.style.cursor = "pointer";
            box.style.backgroundImage = "url('" + links[0] + "')";
            
            box.onclick = function() {
                beginGameWith(this);
            };
        });

        if (autoPlay) setTimeout(function() { randomFrom(boxes).click() }, autoPlayDelay);
    };

    repeatAction.onclick = function() {
        autoPlay = autoPlayCount;
        playAgainButton.click();
    };

    if (autoPlay) {
        autoPlay--;
        setTimeout(function() { playAgainButton.click() }, autoPlayDelay);
    }
}

function randomFrom(arr) {
    return arr[range(0, arr.length - 1, true)];
}

function range(min, max, int = false) {
    const r = Math.random() * (max - min + 1) + min;
    return int ? Math.floor(r) : r;
}

function loadImage(n = 0) {
    const image = document.createElement("img");
    image.src = links[n];
    info.innerHTML = 'Loading "' + links[n].split('/').reverse()[0] + '"';
    image.onload = function() {
        if (n < links.length - 1) {            
            loadImage(n + 1);
        } else {
            info.innerHTML = "Click to choose one box";
            initialize();
        }
    };
}

// ===== EVENTS =====
window.onload = function() { loadImage() };//launchbox-disable infinite-loop-detection