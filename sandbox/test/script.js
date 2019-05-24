function DrawableCanvas(el) {
    const px = 10;
    const ctx = el.getContext('2d');
    let x = [];
    let y = [];
    let moves = [];
    let isPainting = false;
    const clear = () => ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    const addPoint = (_x, _y, isMoving) => {
        x.push(_x);
        y.push(_y);
        moves.push(isMoving);
    };
    const redraw = () => {
        clear();
        ctx.strokeStyle = 'red';
        ctx.lineJoin = 'round';
        ctx.lineWidth = px;
        for (let i = 0; i < moves.length; i++) {
            ctx.beginPath();
            if (moves[i] && i) {
                ctx.moveTo(x[i - 1], y[i - 1]);
            } else {
                ctx.moveTo(x[i] - 1, y[i]);
            }
            ctx.lineTo(x[i], y[i]);
            ctx.closePath();
            ctx.stroke();
        }
    };
    const drawLine = (x1, y1, x2, y2, color = 'lightgray') => {
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineJoin = 'miter';
        ctx.lineWidth = 1;
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    };
    const grid = () => {
        const w = el.clientWidth;
        const h = el.clientHeight;
        const p = el.clientWidth / px;
        const xStep = w / p;
        const yStep = h / p;
        for (let x = 0; x < w; x += xStep) {
            drawLine(x, 0, x, h);
        }
        for (let y = 0; y < h; y += yStep) {
            drawLine(0, y, w, y);
        }
    };
    const cell = (x, y, w, h) => {
        ctx.fillStyle = 'blue';
        ctx.strokeStyle = 'blue';
        ctx.lineJoin = 'miter';
        ctx.lineWidth = 1;
        ctx.rect(x, y, w, h);
        ctx.fill();
    };
    this.reset = () => {
        isPainting = false;
        x = [];
        y = [];
        moves = [];
        clear();
    };
    this.getPixelArray = () => {
        const pixelArray = [];

        for (let x = 0; x < canvasSize; x += px) {
            for (let y = 0; y < canvasSize; y += px) {
                const pixels = ctx.getImageData(x, y, px, px).data.filter((_, i) => i % 4 == 0).map(v => v ? 1 : 0);
                pixelArray.push(pixels.includes(1) ? 1 : 0);
            }
        }

        return pixelArray;
    };
    this.getVector = (debug = true) => {
        const w = el.clientWidth;
        const h = el.clientHeight;
        const p = el.clientWidth / px;
        const xStep = w / p;
        const yStep = h / p;
        const vector = [];

        for (let x = 0; x < w; x += xStep) {
            for (let y = 0; y < h; y += yStep) {
                const data = ctx.getImageData(x, y, xStep, yStep);
                let nonEmptyPixelsCount = 0;
                for (let i = 0; i < data.data.length; i += 4) {
                    const isEmpty = data.data[i] === 0;
                    if (!isEmpty) {
                        nonEmptyPixelsCount += 1;
                    }
                }
                if (nonEmptyPixelsCount > 1 && debug) {
                    cell(x, y, xStep, yStep);
                }
                vector.push(nonEmptyPixelsCount > 1 ? 1 : 0);
            }
        }
        if (debug) {
            grid();
        }
        console.log(vector);
        return vector;
    };
    const startMove = (event) => {
        const bounds = event.target.getBoundingClientRect();
        const x = event.clientX - bounds.left;
        const y = event.clientY - bounds.top;
        isPainting = true;
        addPoint(x, y, false);
        redraw();
    };
    const onMove = (event) => {
        const bounds = event.target.getBoundingClientRect();
        const x = event.clientX - bounds.left;
        const y = event.clientY - bounds.top;
        if (isPainting) {
            addPoint(x, y, true);
            redraw();
        }
    };
    const stopMove = (event) => {
        isPainting = false;
    };
    el.addEventListener('mousedown', startMove);
    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseup', stopMove);
    el.addEventListener('mouseleave', stopMove);

    // TOUCH SCREEN EVENTS
    const startTouchMove = (event) => {
        const bounds = event.target.getBoundingClientRect();
        const x = event.touches[0].clientX - bounds.left;
        const y = event.touches[0].clientY - bounds.top;
        isPainting = true;
        addPoint(x, y, false);
        redraw();
    };
    const onTouchMove = (event) => {
        const bounds = event.target.getBoundingClientRect();
        const x = event.touches[0].clientX - bounds.left;
        const y = event.touches[0].clientY - bounds.top;
        if (isPainting) {
            addPoint(x, y, true);
            redraw();
        }
    };
    const stopTouchMove = (event) => {
        isPainting = false;
    };
    el.addEventListener('touchstart', startTouchMove);
    el.addEventListener('touchmove', onTouchMove);
    el.addEventListener('touchend', stopTouchMove);
}

//const guessCanvas = new DrawableCanvas(document.getElementById('guessCanvas'));
var guessCanvas;

var net;

var trainedData = [];


/**
 * CUSTOM CODE
 */

var btnPixelArray = document.querySelector('#btnPixelArray');
btnPixelArray.onclick = () => {
    canvasArray[0].getPixelArray();
};

var canvasSize = 500;
var blackBG = document.getElementById('blackBG');
var maxIteration = 20;
var wordArray = [];
var currentPage = 1;
var pageWidth = window.innerWidth;
var fluidContainer = document.querySelector('.fluid-container');
//fluidContainer.style.width = pageWidth + "px";

var canvasContainer = document.getElementById('canvasContainer');
canvasContainer.marginLeft = 0;

var canvasSlider = document.querySelector('#canvasSlider');
canvasSlider.style.width = canvasSize + 'px';
canvasSlider.style.height = canvasSize + 'px';

var guessCanvasContainer = document.querySelector('#guessCanvasContainer');
guessCanvasContainer.style.width = canvasSize + 'px';
guessCanvasContainer.style.height = canvasSize + 'px';

var canvasCount = 0;
var canvasWidth = canvasSize;
var canvasArray = [];
var prevCV = document.querySelector('.prevCV');
prevCV.onclick = previousCanvas;

var nextCV = document.querySelector('.nextCV');
nextCV.onclick = nextCanvas;


var clearBtn = document.getElementById('clearBtn');
clearBtn.onclick = clearCanvas;

var restartBtn = document.getElementById('restartBtn');
restartBtn.onclick = restart;

var objective = document.getElementById('objective');
objective.oninput = onInputObjective;

var goPage2Btn = document.getElementById('goPage2Btn');
goPage2Btn.disabled = true;
goPage2Btn.onclick = () => {
    wordArray.push(objective.value);
    gotoPage(2);
    objectiveName1.innerHTML = objective.value;
    objectiveName2.innerHTML = objective.value;

    addNewSample();
};

var addMoreSample = document.getElementById('addMoreSample');
addMoreSample.onclick = addNewSample;

var trainingBtn = document.getElementById('trainingBtn');
trainingBtn.onclick = () => {
    showBlackBG();
    setTimeout(startTraining, 100);
};

// get all pages
var pageArray = [...document.querySelectorAll('.page')];

function onInputObjective() {
    //console.log(objective.value);
    if (objective.value.length > 0) {
        goPage2Btn.disabled = false;
    }
    else {
        goPage2Btn.disabled = true;
    }
}

function gotoPage(pageNumber) {
    pageArray[pageNumber - 1].style.left = 0;
    if (pageNumber > currentPage) {
        // move to the left
        pageArray[currentPage - 1].style.left = -pageWidth + 'px';
    }
    else {
        // move to the right
        pageArray[currentPage - 1].style.left = pageWidth + 'px';

        if (pageNumber == 1) {
            initialPages();
        }
    }

    currentPage = pageNumber;
}

function initialPages() {
    for (var i = 1; i < pageArray.length; i++) {
        pageArray[i].style.left = pageWidth + 'px';
    }
}

function addNewSample() {
    canvasCount++;

    var cv = document.createElement('canvas');
    cv.id = 'cv' + canvasCount;
    cv.className = 'cv';
    cv.width = canvasSize;
    cv.height = canvasSize;
    cv.style.left = ((canvasCount - 1) * canvasWidth) + 'px';


    canvasContainer.appendChild(cv);
    canvasContainer.marginLeft = -((canvasCount - 1) * canvasWidth);
    canvasContainer.style.marginLeft = canvasContainer.marginLeft + 'px';

    var newDrawableCV = new DrawableCanvas(cv);
    canvasArray.push(newDrawableCV);
}

function previousCanvas() {
    canvasContainer.marginLeft += canvasWidth;
    if (canvasContainer.marginLeft >= 0) {
        canvasContainer.marginLeft = 0;
    }
    canvasContainer.style.marginLeft = canvasContainer.marginLeft + 'px';
}

function nextCanvas() {
    canvasContainer.marginLeft -= canvasWidth;
    if (canvasContainer.marginLeft <= -((canvasCount - 1) * canvasWidth)) {
        canvasContainer.marginLeft = -((canvasCount - 1) * canvasWidth);
    }
    canvasContainer.style.marginLeft = canvasContainer.marginLeft + 'px'; 
}

function startTraining() {
    //console.log(canvasArray);
    //console.log("start training");

    canvasArray.map(eachCanvas => {
        var outputObj = {};
        outputObj[objective.value] = 1;

        var cvResult = {
            input: eachCanvas.getPixelArray(),
            output: outputObj
        };

        trainedData.push(cvResult);
    });

    //console.log("==== DATA ====");
    //console.log(trainedData);

    net = new brain.NeuralNetwork();
    const result = net.train(trainedData, {
        iterations: maxIteration,
        // TODO: add callback to update the progress bar
        /*
        callback: function(data) {
            //console.log(data);
            //var percentage = (data.iterations / maxIteration) * 100;
            //console.log(percentage);
        },
        callbackPeriod: 5
        */
    });

    //console.log("==== RESULT ====");
    console.log(result);
    
    hideBlackBG();

    // TODO:
    createGuessCanvas();
    //guessCanvasContainer
    gotoPage(3);    
}

function createGuessCanvas() {
    guessCanvasContainer.innerHTML = '';

    var cv = document.createElement('canvas');
    cv.id = 'guessCanvas';
    cv.width = canvasSize;
    cv.height = canvasSize;
    guessCanvasContainer.appendChild(cv);

    guessCanvas = new DrawableCanvas(cv);
}

var guessBtn = document.getElementById('guessBtn');
guessBtn.onclick = () => {
    showBlackBG('AI is guessing...');
    setTimeout(onGuess, 100);
};


function onGuess() {
    //const result = brain.likely(guessCanvas.getPixelArray(), net);
    const result = net.run(guessCanvas.getPixelArray());

    var guessObject = Object.keys(result).reduce((prev, current) => {
        return result[current] > result[prev] ? current : prev;
    });

    console.log(result);
    //console.log(guessObject);
    alert('I think you draw the ' + guessObject);
    hideBlackBG();
    guessCanvas.reset();
}

function restart() {
    // reset objective
    objective.value = '';

    canvasContainer.innerHTML = '';
    canvasArray = [];

    canvasCount = 0;

    gotoPage(1);
}

function showBlackBG(message = 'AI is learning...') {
    blackBG.style.left = '0px';
    loadingMessage.innerHTML = message;
}

function hideBlackBG() {
    blackBG.style.left = '-99999px';
}

function clearCanvas() {
    //console.log(Math.abs(canvasContainer.marginLeft) / canvasWidth);
    var canvasId = Math.floor(Math.abs(canvasContainer.marginLeft) / canvasWidth);

    canvasArray[canvasId].reset();
}

initialPages();