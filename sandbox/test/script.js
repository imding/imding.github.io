//  JavaScript

var proxyurl = 'https://cors-anywhere.herokuapp.com/';
var baseUrl = proxyurl + 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/969699/';
var DrumAI = new mm.MusicRNN('https://storage.googleapis.com/download.magenta.tensorflow.org/tfjs_checkpoints/music_rnn/drum_kit_rnn');
var Tone = mm.Player.tone;

var soundNames = [
    '808-kick',
    'flares-snare',
    '808-hihat',
    '808-hihat-open',
    'slamdam-tom-low',
    'slamdam-tom-mid',
    'slamdam-tom-high',
    '909-clap',
    '909-rim',
];
var trackNames = [
    'Kick Drum',
    'Snare',
    'Hi-Hat',
    'Hi-Hat Open',
    'Tom-Tom Low',
    'Tom-Tom Mid',
    'Tom-Tom High',
    'Clap',
    'Rim',
];
var trackData = [
    [0, 7],
    [],
    [2, 5],
    [],
];
var seedSteps = trackData.length;
var aiSteps = 20;
var fullTrackLength = seedSteps + aiSteps;
var stepCounter = 0;
var stepInterval = 120;
var trackIsPlaying = false;
var stopPlaying = false;

var tempo = 120;
var temperature = 1.3;

while (trackData.length < fullTrackLength) {
    trackData.push([]);
}

var drumKit = soundNames.map(eachName => new Tone.Player(baseUrl + eachName + '-vh.mp3').toMaster());

Tone.Buffer.on('load', enablePlay);
DrumAI.initialize().then(enableAI);

function enablePlay() {
    playButton.innerText = 'Play';
    playButton.disabled = false;
    playButton.addEventListener('click', playOrStop);

    drawGrid();
}

function enableAI() {
    generateButton.innerText = 'Create New Beats';
    generateButton.disabled = false;
    generateButton.addEventListener('click', generateTrack);
}

function playOrStop() {
    if (trackIsPlaying) {
        trackIsPlaying = false;
        stopPlaying = true;
        playButton.innerText = 'Play';
    }
    else {
        trackIsPlaying = true;
        playButton.innerText = 'Stop';
        playTrack();
    }
}

function playTrack() {
    if (stopPlaying) {
        stepCounter = 0;
        trackIsPlaying = false;
        stopPlaying = false;
        return;
    }

    var step = trackData[stepCounter];

    if (step) {
        step.forEach(soundIndex => {
            var button = grid.children[soundIndex].children[stepCounter];

            button.classList.add('highlight');
            setTimeout(() => button.classList.remove('highlight'), stepInterval / 1.5);

            drumKit[soundIndex].start();
        });
    }

    stepCounter++;

    if (stepCounter == trackData.length) {
        stepCounter = 0;
    }

    setTimeout(playTrack, stepInterval);
}

function generateTrack() {
    var seedPattern = trackData.slice(0, seedSteps);
    var seedSequence = getSeedSequence(seedPattern);
    var handleResult = function(aiSequence) {
        var trackContainers = grid.querySelectorAll('.trackContainers');
        var aiPattern = getAiPattern(aiSequence, aiSteps);

        trackContainers.forEach(soundContainer => {
            var oneEighthButtons = soundContainer.querySelectorAll('.oneEighthButtons');

            oneEighthButtons.forEach((oneEighthButton, stepIndex) => {
                if (stepIndex < seedSteps) {
                    return;
                }
                else {
                    oneEighthButton.classList.remove('active');
                    aiPattern[stepIndex - seedSteps] = aiPattern[stepIndex - seedSteps] || [];
                }
            });
        });

        aiPattern.forEach((stepData, stepIndex) => {
            stepIndex += seedSteps;

            stepData.forEach(soundIndex => {
                var trackContainer = grid.children[soundIndex];
                var step = trackContainer.children[stepIndex];

                if (!step.classList.contains('active')) {
                    step.classList.add('active');
                }
            });
        });

        trackData = seedPattern.concat(aiPattern);
    };

    if (trackIsPlaying) {
        stopPlaying = true;
        playButton.innerText = 'Play';
    }

    DrumAI.continueSequence(seedSequence, aiSteps, temperature).then(handleResult);
}

function drawGrid() {
    while (grid.children.length < soundNames.length) {
        var trackContainer = document.createElement('div');

        while (trackContainer.children.length < trackData.length) {
            var oneEighthButton = document.createElement('div');

            oneEighthButton.className = 'oneEighthButtons';
            oneEighthButton.soundIndex = grid.children.length;
            oneEighthButton.timingIndex = trackContainer.children.length;

            if (trackData[oneEighthButton.timingIndex].includes(oneEighthButton.soundIndex)) {
                oneEighthButton.classList.add('active');
            }

            trackContainer.append(oneEighthButton);
            oneEighthButton.addEventListener('click', updateTrackData);
            oneEighthButton.addEventListener('mouseenter', evt => trackLabel.innerText = trackNames[evt.target.soundIndex]);
            oneEighthButton.addEventListener('mouseleave', () => trackLabel.innerText = '');
        }

        trackContainer.className = 'trackContainers';

        grid.append(trackContainer);
    }
}

function updateTrackData(evt) {
    var soundIndex = evt.target.soundIndex;
    var timingIndex = evt.target.timingIndex;
    var timing = trackData[timingIndex] || [];

    if (timing.includes(soundIndex)) {
        timing.splice(timing.indexOf(soundIndex), 1);
    }
    else {
        timing.push(soundIndex);
        drumKit[soundIndex].start();
    }

    evt.target.classList.toggle('active');
    trackData[timingIndex] = timing;
}

function getSeedSequence(seedPattern) {
    var timeSignatures = [{ time: 0, numerator: 4, denominator: 4 }];
    var tempos = [{ time: 0, qpm: tempo }];
    var midiDrums = [36, 38, 42, 46, 41, 43, 45, 49, 51];
    var notes = seedPattern.flatMap((step, index) => step.map(d => ({
        pitch: midiDrums[d],
        startTime: index * 0.5,
        endTime: (index + 1) * 0.5,
    })));

    return mm.sequences.quantizeNoteSequence({
        ticksPerQuarter: 220,
        totalTime: seedPattern.length / 2,
        timeSignatures,
        tempos,
        notes,
    }, 1);
}

function getAiPattern(aiSequence) {
    var aiPattern = [];
    var reverseMidiMapping = new Map([
        [36, 0], [35, 0],
        [38, 1], [27, 1], [28, 1], [31, 1], [32, 1], [33, 1], [34, 1], [37, 1], [39, 1], [40, 1], [56, 1], [65, 1], [66, 1], [75, 1], [85, 1],
        [42, 2], [44, 2], [54, 2], [68, 2], [69, 2], [70, 2], [71, 2], [73, 2], [78, 2], [80, 2],
        [46, 3], [67, 3], [72, 3], [74, 3], [79, 3], [81, 3],
        [45, 4], [29, 4], [41, 4], [61, 4], [64, 4], [84, 4],
        [48, 5], [47, 5], [60, 5], [63, 5], [77, 5], [86, 5], [87, 5],
        [50, 6], [30, 6], [43, 6], [62, 6], [76, 6], [83, 6],
        [49, 7], [55, 7], [57, 7], [58, 7],
        [51, 8], [52, 8], [53, 8], [59, 8], [82, 8],
    ]);

    aiSequence.notes.forEach(note => {
        var stepIndex = note.quantizedStartStep;
        var pitch = note.pitch;
        var step = reverseMidiMapping.get(pitch);

        if (aiPattern[stepIndex]) {
            aiPattern[stepIndex].push(step);
        }
        else {
            aiPattern[stepIndex] = [step];
        }
    });

    return aiPattern;
}
