var stackSize = 3;
var delay = stackSize * 1200;

var lastSlice = stackBase;

var demoStack;
var inputOptions = document.querySelectorAll('.inputOptions');

disableAllOptions();
newBurger();

addHandler(inputOptions[0], 0);
addHandler(inputOptions[1], 1);
addHandler(inputOptions[2], 2);
addHandler(inputOptions[3], 3);

window.onkeydown = function () {
    var keyNumber = Number(event.key);

    if (keyNumber > 0 && keyNumber < 5) {
        inputOptions[keyNumber - 1].click();
    }
    else if (event.key == 'Enter' && !action.hidden) {
        action.click();
    }
};

function addHandler(option, optionIndex) {
    option.onclick = function () {
        lastSlice = createSliceByIndex(optionIndex);

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
            createSliceByIndex(4);

            resetBurger();
        }
    };
}

function resetBurger() {
    disableAllOptions();
    notification.style.opacity = 1;
    action.hidden = false;
    action.onclick = newBurger;
}

function newBurger() {
    clearSlices();
    demoStack = [];

    info.textContent = 'Watch closely and memorise the burger stack';
    action.hidden = true;

    startDemo();
    setTimeout(clearSlices, delay);
    setTimeout(enableAllOptions, delay);
}

function startDemo() {
    for (i = 0; i < stackSize; i++) {
        //  minimum:
        // var dice = Math.floor(Math.random() * 4);

        //  extension:
        var dice;

        do {
            dice = Math.floor(Math.random() * 4);
        } while (lastSlice.className.includes(getSliceNameByIndex(dice)));

        var newSlice = createSliceByIndex(dice);

        demoStack.push(newSlice);
        lastSlice = newSlice;
    }

    createSliceByIndex(4);
}

function clearSlices() {
    lastSlice = stackBase;

    while (stage.children.length > 1) {
        stage.removeChild(stage.lastChild);
    }
}

function createSliceByIndex(index) {
    var slice = document.createElement('div');

    if (index < 4) {
        var className = getSliceNameByIndex(index) + ' slice';

        slice.setAttribute('class', className);
    }
    else if (index === 4) {
        slice.setAttribute('id', 'stackCap');
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

function disableAllOptions() {
    disable(inputOptions[0]);
    disable(inputOptions[1]);
    disable(inputOptions[2]);
    disable(inputOptions[3]);
}

function disable(option) {
    option.disabled = true;
    option.style.filter = 'grayscale(100%)';
    option.style.cursor = 'not-allowed';
}

function enableAllOptions() {
    enable(inputOptions[0]);
    enable(inputOptions[1]);
    enable(inputOptions[2]);
    enable(inputOptions[3]);

    notification.style.opacity = 0;
}

function enable(option) {
    option.disabled = false;
    option.style.filter = 'initial';
    option.style.cursor = 'pointer';
}

function css(el, p) {
    var value = window.getComputedStyle(el).getPropertyValue(p);
    return parseFloat(value);
}