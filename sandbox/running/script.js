var start, world, ground, runner, stopwatch, progress, energy, info;
var speed, energyGain, runnerPos, lastUpdate, delta, timer;
var mode = 0;       // starting mode: 0 is idle, 1 is jog, 2 is run, 3 is sprint
var paused = true;
var exhausted = false;
var clouds = [];
var link = ["http://bsdacademysandbox.com/curriculum/wp-content/uploads/2017/11/runner_ready.gif"];

link.push(link[0].replace("_ready", "_jog"));
link.push(link[0].replace("_ready", "_run"));
link.push(link[0].replace("_ready", "_sprint"));
link.push(link[0].replace("_ready", "_exhausted"));
link.push(link[4]);

window.onload = () => {
    stopwatch = document.getElementById("stopwatch");
    progress = document.getElementById("progress");
    energy = document.getElementById("energy");
    info = document.getElementById("info");
    world = document.getElementById("world");
    start = document.getElementById("start");
    ground = document.getElementById("ground");
    
    start.onclick = function() {
        energy.value = 100;
        energy.max = 100;
        timer = Date.now();
        paused = false;
        setMode(1);
        this.disabled = true;
    };
    
    progress.value = 0;
    progress.max = 10000;
    
    loadAnimation();
    window.requestAnimationFrame(updateWorld);
};

function iniWorld() {
    runner = document.createElement("img");
    runner.src = link[0];
    
    runner.style.height = "80px";
    runner.style.left = "25%";
    runner.style.bottom = "25px";
    world.appendChild(runner);
    
    energy.style.width = runner.offsetWidth + "px";
    energy.style.left = runner.style.left;
    energy.style.top = runner.offsetTop - 15 + "px";
    info.innerHTML = "Runner Status: <span style='color:green'>READY<span>";
    createCloud();
}

function loadAnimation(n = 0) {
    let img = document.createElement("img");
    img.src = link[n];
    info.innerHTML = "Loading: <span style='color:green'>" + link[n].match(/\w+\.gif/i)[0] + "<span>";
    img.onload = function() {
        if (n < link.length - 1) {
            return loadAnimation(n + 1);
        } else {
            iniWorld();
            start.disabled = false;
        }
    };
}

function updateWorld(timestamp) {
    if (!lastUpdate) lastUpdate = timestamp;
    delta = timestamp - lastUpdate;
    updateClouds();
    
    if (!paused) {
        if (progress.value == progress.max ) {
            setMode(5);
            finisher();
        } else {
            updateStopWatch();
            updatePerformance();
            updateRunnerPos();
        }
    }
    lastUpdate = timestamp;
    window.requestAnimationFrame(updateWorld);
}

function updatePerformance() {
    energy.value += energyGain;
    
    if (energy.value > 0) {
        if (exhausted && energy.value > 60) {
            exhausted = false;
            setMode(1);
        } else {
            progress.value += delta * speed;
        }
    } else {
        setMode(4);     // become exhausted
        exhausted = true;
    }
}

function updateRunnerPos() {
    if (runner.offsetLeft != world.clientWidth * runnerPos && !exhausted) {
        var offset = (runner.offsetLeft - world.clientWidth * runnerPos) * delta / 1000;
        move(runner, offset);
        energy.style.left = runner.style.left;
    }
}

function updateStopWatch() {
    var elapsed = Date.now() - timer,
        m = Math.floor(elapsed / 60000 % 60),
        s = Math.floor(elapsed / 1000 % 60),
        ms = Math.floor(elapsed / 10 % 100);
    stopwatch.innerHTML = pad(m) + ":" + pad(s) + ":" + pad(ms);
}

function createCloud() {
    if (!paused) {
        var cloud = document.createElement("img"), d = range(-15, 80);
        cloud.src = "http://bsdacademysandbox.com/curriculum/wp-content/uploads/2017/11/cloud.png";
        cloud.onload = function() {
            cloud.style.top = d + "px";
            cloud.style.left = world.offsetWidth + "px";
            cloud.style.width = remap(d, -15, 80, 80, 40) + "px";
            world.appendChild(cloud);
            clouds.unshift(cloud);
        };
    }
    setTimeout(createCloud, cloudSeed() * 1000);
}

function cloudSeed() {
    return range(3, 10) / remap(speed, 0, 0.15, 1, 4);
}

function updateClouds() {
    clouds.forEach(function(c, i) {
        move(c, Math.max(delta * speed, 0.5) * c.offsetWidth / 80);
        if (c.offsetLeft <= -c.offsetWidth) {
            world.removeChild(c);
            clouds.splice(i, 1);
        }
    });
}

function setMode(n) {
    if (!exhausted && !paused && mode != n) {
        mode = n;
        runner.src = link[mode];
        
        switch (mode) {
            case 1:     // start jogging
                runnerPos = 0.3;
                speed = 0.05;
                energyGain = 0.06;
                info.innerHTML = "Runner Status: <span style='color:yellow'>JOGGING<span>";
                break;
            case 2:     // start running
                runnerPos = 0.4;
                speed = 0.1;
                energyGain = -0.08;
                info.innerHTML = "Runner Status: <span style='color:yellow'>RUNNING<span>";
                break;
            case 3:     // start sprinting
                runnerPos = 0.55;
                speed = 0.15;
                energyGain = -0.2;
                info.innerHTML = "Runner Status: <span style='color:yellow'>SPRINTING<span>";
                break;
            case 4:     // become exhausted
                speed = 0;
                energyGain = 0.05;
                info.innerHTML = "Runner Status: <span style='color:firebrick'>EXHAUSHTED<span>";
                break;
            case 5:     // finisher
                paused = true;
                speed = 0;
                energyGain = 0;
                info.innerHTML = "Runner Status: <span style='color:green'>FINISHER!<span>";
                break;
        }
    } else {
        if (exhausted) {
            alert("You're exhausted, wait until your energy recovers to 60%.");
        }
        else if (mode != n) {
            alert('Click "Go!" to start the race.');
        }
    }
}

function finisher() {
    var popup = document.createElement("div"),
        resetButton = document.createElement("button");
        
    popup.id = "popup";
    popup.innerHTML = "<p>Congratulations! You have finished the race.</p>";
    resetButton.id = "reset";
    resetButton.innerHTML = "REPLAY";
    resetButton.onclick = reset;
    world.appendChild(popup);
    popup.appendChild(resetButton);
}

function reset() {
    world.removeChild(popup);
    runner.src = link[0];
    runner.style.left = "25%";
    progress.value = 0;
    energy.value = 100;
    energy.style.left = runner.style.left;
    start.disabled = false;
  	stopwatch.innerHTML = "00:00:00";
    info.innerHTML = "Runner Status: <span style='color:green'>READY<span>";
}

function pos(e, p) {
    return parseFloat(window.getComputedStyle(e).getPropertyValue(p));
}

function move(e, d) {
    e.style.left = pos(e, "left") - d + "px";
}

function clamp(v, min, max) {
    return Math.max(min, Math.min(v, max));
}

function range(min, max, int = false) {
    var r = Math.random() * (max - min) + min;
    return int ? Math.round(r) : r;
}

function remap(v, iMin, iMax, oMin, oMax) {
    return oMin + (v - iMin) * (oMax - oMin) / (iMax - iMin);
}

function pad(n) {
    return n.toString().length == 2 ? n : '0' + n.toString();
}