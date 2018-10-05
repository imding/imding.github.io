var stackSize = 3;
var delay = stackSize * 1200;

var stackCap;
var lastSlice = stackBase;

var demoStack;
var inputOptions = document.querySelectorAll('.opts');

disableInput();
newBurger();

inputOptions.forEach((opt, i) => {
    opt.onclick = function () {
        lastSlice = createSliceByIndex(i);

        // check for player input
        var expected = demoStack.shift();

        if (lastSlice.className != expected.className) {
            info.textContent = "Nice try, but that wasn't quite right.";
            action.textContent = 'Retry';

            resetBurger();
        }
        else if (demoStack.length === 0) {
            info.textContent = "Well done! Let's see you challenge the next burger.";
            action.textContent = 'Next';

            stackSize++;
            stackCap = createSliceByIndex(4);

            resetBurger();
        }
    };
});

function resetBurger() {
    disableInput();
    notification.style.opacity = 1;
    action.hidden = false;
    action.onclick = newBurger;
}

function newBurger() {
    clearSlices();
    demoStack = [];

    info.textContent = 'Watch closely and memerise the burger stack';
    action.hidden = true;

    startDemo();
    setTimeout(clearSlices, delay);
    setTimeout(enableInput, delay);
}

function startDemo() {
    for (i = 0; i < stackSize; i++) {
        var dice = Math.floor(Math.random() * 4);

        // extension:
        // var dice;

        // do {
        //     dice = Math.floor(Math.random() * 4);
        // } while (lastSlice.className.includes(getSliceNameByIndex(dice)));

        var newSlice = createSliceByIndex(dice);

        demoStack.push(newSlice);
        lastSlice = newSlice;
    }

    stackCap = createSliceByIndex(4);
}

function clearSlices() {
    lastSlice = stackBase;

    if (stackCap) {
        stage.removeChild(stackCap);
        stackCap = null;
    }

    document.querySelectorAll('.slice').forEach(slice => stage.removeChild(slice));
}

function createSliceByIndex(n) {
    var slice = document.createElement('div');
    var name = getSliceNameByIndex(n);

    if (n < 4) {
        slice.className = 'slice';
        slice.classList.add(name);
    }
    else if (n === 4) {
        slice.id = 'stackCap';
    }

    stage.appendChild(slice);

    slice.style.top = css(lastSlice, 'top') - css(slice, 'height') + 'px';

    return slice;
}

function getSliceNameByIndex(n) {
    if (n === 0) {
        return 'meat';
    }
    else if (n === 1) {
       return 'lettuce';
    }
    else if (n === 2) {
       return 'cheese';
    }
    else if (n === 3) {
       return 'onion';
    }
}

function disableInput() {
    inputOptions.forEach(opt => {
        opt.disabled = true;
        opt.style.filter = 'grayscale(100%)';
        opt.style.cursor = 'not-allowed';
    });
}

function enableInput() {
    inputOptions.forEach(opt => {
        opt.disabled = false;
        opt.style.filter = 'initial';
        opt.style.cursor = 'pointer';
    });

    notification.style.opacity = 0;
}

function css(el, p) {
    var value = window.getComputedStyle(el).getPropertyValue(p);
    return parseFloat(value);
}