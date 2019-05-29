// bsd-config(disable-instrumentation)
// bsd-disable infinite-loop-detection

const pageTarget = document.querySelector('#pageTarget');
const pageTraining = document.querySelector('#pageTraining');
const pageGuess = document.querySelector('#pageGuess');

const inputSubject1 = document.querySelector('#inputSubject1');
const inputSubject2 = document.querySelector('#inputSubject2');

const subjectContainer1 = document.querySelector('#subjectContainer1');
const subjectContainer2 = document.querySelector('#subjectContainer2');

const cvsTrainSubject1 = new DrawableCanvas(document.querySelector('#cvsTrainSubject1'));
const cvsTrainSubject2 = new DrawableCanvas(document.querySelector('#cvsTrainSubject2'));
const cvsGuess = new DrawableCanvas(document.querySelector('#cvsGuess'));

const btnBeginTraining = document.querySelector('#btnBeginTraining');
const btnBeginGuessing = document.querySelector('#btnBeginGuessing');
const btnSubmitSubject1 = document.querySelector('#btnSubmitSubject1');
const btnSubmitSubject2 = document.querySelector('#btnSubmitSubject2');

const pixelateThreshold = 0.6;
const canvasSize = 300;
const strokeWidth = 10;
const learningRate = 0.3;
const iterations = 1000;

let subject1;
let subject2;

let minSamples = 4;
let subjectSamples1 = minSamples;
let subjectSamples2 = minSamples;

let training = [];

const {
    Layer,
    Network
} = window.synaptic;

let inputLayer = new Layer(Math.pow(canvasSize / strokeWidth, 2));
let hiddenLayer = new Layer(strokeWidth);
let outputLayer = new Layer(2);

inputLayer.project(hiddenLayer);
hiddenLayer.project(outputLayer);

let network = new Network({
    input: inputLayer,
    hidden: [hiddenLayer],
    output: outputLayer,
});

console.clear();

document.querySelectorAll('canvas').forEach(canvas => {
    canvas.width = canvasSize;
    canvas.height = canvasSize;
});

btnBeginTraining.onclick = () => {
    subject1 = inputSubject1.value.trim();
    subject2 = inputSubject2.value.trim();

    subjectContainer1.querySelector('h3').textContent = `a ${subject1}:`;
    subjectContainer2.querySelector('h3').textContent = `a ${subject2}:`;

    updateMinSamples();

    pageTarget.style.display = 'none';
    pageTraining.style.display = 'inherit';
};

btnSubmitSubject1.onclick = () => submitTraining(cvsTrainSubject1, [1, 0]);
btnSubmitSubject2.onclick = () => submitTraining(cvsTrainSubject2, [0, 1]);

btnBeginGuessing.onclick = () => {
    startTraining();
    pageTraining.style.display = 'none';
    pageGuess.style.display = 'inherit';
};

btnGuess.onclick = () => {
    const result = network.activate(cvsGuess.getPixelArray());

    cvsGuess.reset();

    // alert(`${subject1}: ${Math.floor(result[0] * 100)}%, ${subject2}: ${Math.floor(result[1] * 100)}%`);
    console.log(`${subject1}: ${Math.floor(result[0] * 100)}%`);
    console.log(`${subject2}: ${Math.floor(result[1] * 100)}%`);
};

function submitTraining(canvas, _outputLayer) {
    training.push({
        input: canvas.getPixelArray(),
        output: _outputLayer,
    });

    subjectSamples1 = Math.max(0, subjectSamples1 - _outputLayer[0]);
    subjectSamples2 = Math.max(0, subjectSamples2 - _outputLayer[1]);

    updateMinSamples();

    btnBeginGuessing.disabled = Boolean(subjectSamples1 + subjectSamples2);

    canvas.reset();
}

function startTraining() {
    for (let i = 0; i < iterations; i++) {
        training = _.shuffle(training);

        training.forEach(data => {
            network.activate(data.input);
            network.propagate(learningRate, data.output);
        });
    }
}

function updateMinSamples() {
    btnSubmitSubject1.textContent = `Submit (${subjectSamples1})`;
    btnSubmitSubject2.textContent = `Submit (${subjectSamples2})`;
}


function DrawableCanvas(el) {
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
        ctx.lineWidth = strokeWidth;
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
        const p = el.clientWidth / strokeWidth;
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
        let pixelArray = [];

        for (let y = 0; y < el.height; y += strokeWidth) {
            pixelArray.push([]);
            for (let x = 0; x < el.width; x += strokeWidth) {
                const pixels = ctx.getImageData(x, y, strokeWidth, strokeWidth).data.filter((_, i) => i % 4 == 0).map(v => v ? 1 : 0);
                const halfPixel = pixels.filter(p => p == 1).length / pixels.filter(p => p == 0).length >= pixelateThreshold * 2;
                pixelArray[y / strokeWidth].push(halfPixel ? 1 : 0);
            }
        }

        let leadingZero = 0,
            trailingZero = 0;

        pixelArray = pixelArray.filter(row => {
            const _row = Array.from(row);

            if (row.includes(1)) {
                leadingZero = leadingZero ? Math.min(leadingZero, _row.indexOf(1)) : _row.indexOf(1);
                trailingZero = trailingZero ? Math.min(trailingZero, _row.reverse().indexOf(1)) : _row.reverse().indexOf(1);
                return true;
            }

            return;
        });

        pixelArray = pixelArray.map(row => row.reverse().slice(trailingZero).reverse().slice(leadingZero));

        if (pixelArray[0].length > pixelArray.length) {
            const margin = (pixelArray[0].length - pixelArray.length) / 2;
            const topMargin = new Array(Math.floor(margin)).fill(new Array(pixelArray[0].length).fill(0));
            const bottomMargin = new Array(Math.ceil(margin)).fill(new Array(pixelArray[0].length).fill(0));

            pixelArray = [...topMargin, ...pixelArray, ...bottomMargin];
        }
        else if (pixelArray[0].length < pixelArray.length) {
            const margin = (pixelArray.length - pixelArray[0].length) / 2;
            const leftMargin = new Array(Math.ceil(margin)).fill(0);
            const rightMargin = new Array(Math.floor(margin)).fill(0);

            pixelArray.forEach((_, x) => pixelArray[x] = [...leftMargin, ...pixelArray[x], ...rightMargin]);
        }

        let scaledArray = new Array(canvasSize / strokeWidth).fill(new Array(canvasSize / strokeWidth).fill(0));
        const ratio = {
            x: scaledArray[0].length / pixelArray[0].length,
            y: scaledArray.length / pixelArray.length,
        };

        scaledArray = scaledArray.map((row, y) => {
            return row.map((_, x) => {
                return pixelArray[Math.floor(y / ratio.y)][Math.floor(x / ratio.x)];
            });
        });

        // console.clear();
        // console.log(pixelArray);
        console.log(scaledArray);
        // console.log(scaledArray.flat());
        return scaledArray.flat();
    };
    this.getVector = (debug = true) => {
        const w = el.clientWidth;
        const h = el.clientHeight;
        const p = el.clientWidth / strokeWidth;
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