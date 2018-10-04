var stackSize = 3;
var delay = stackSize * 1200;

var stackCap;
var lastSlice = stackBase;

var demoStack;
var inputOptions = document.querySelectorAll('.opts');

inputOptions.forEach((opt, i) => {
    opt.onclick = function() {
        var newSlice = createSliceByIndex(i);

        lastSlice = newSlice;

        // check for player input
        var demoSlice = demoStack.shift();

        if (newSlice.className != demoSlice.className) {
            fail();
        } else if (demoStack.length === 0) {
            success();
        }
    };
});

disableInput();
newBurger();

function fail() {
    disableInput();
    notification.style.opacity = 1;
    info.textContent = "Nice try, but that wasn't quite right.";
    action.hidden = false;
    action.textContent = 'Retry';
    action.onclick = newBurger;
}

function success() {
    stackCap = createSliceByIndex(4);
    disableInput();
    notification.style.opacity = 1;
    info.textContent = "Well done! Let's see you challenge the next burger.";
    action.hidden = false;
    action.textContent = 'Next';
    stackSize++;
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

    if (n < 4) {
        slice.classList.add('slice');

        if (n === 0) {
            slice.classList.add('meat');
        } else if (n === 1) {
            slice.classList.add('lettuce');
        } else if (n === 2) {
            slice.classList.add('cheese');
        } else if (n === 3) {
            slice.classList.add('onion');
        }
    } else if (n === 4) {
        slice.id = 'stackCap';
    }

    stage.appendChild(slice);
    alignWithLastSlice(slice);

    return slice;
}

function alignWithLastSlice(slice) {
    slice.style.top = css(lastSlice, 'top') - css(slice, 'height') + 'px';
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