let
    time = 0,
    nth = 0,
    sizeRatio = 0.9,
    puzzle = [],
    puzzleGrid = [],
    fire,
    profile,
    image,
    popup,
    resolution,
    activeIndex,
    activeGrid,
    secondaryLocation,
    bg = {wrapper: null, image: null},
    mouseDown = false,
    tap = Date.now();

const
    levels = [
        {
            link: 'http://bsdacademysandbox.com/curriculum/wp-content/uploads/2018/03/pa-keys.jpeg',
            grid: 2,
        },
        {
            link: 'http://bsdacademysandbox.com/curriculum/wp-content/uploads/2018/03/pa-newyork.png',
            grid: 3,
        },
        {
            link: 'http://bsdacademysandbox.com/curriculum/wp-content/uploads/2018/03/pa-habour.png',
            grid: 4,
        },
        {
            link: 'http://bsdacademysandbox.com/curriculum/wp-content/uploads/2018/03/pa-london.png',
            grid: 4,
        }
    ],
    leaderboard = {
        best: {
            name: '',
            time: 0,
        },
        load: (afterLoad) => {
            showPopup('Loading leaderboard...');
            fire = new Firebase('https://bsd-jigsaw.firebaseio.com/');

            fire.once('value', (snapshot) => {
                document.body.removeChild(popup.element);
                const showInfo = () => {
                    showPopup('No one has solved all 5 puzzles yet. Good Luck!', 'Play', () => {
                        document.body.removeChild(popup.element);
                        toggleFullScreen();
                    });
                    afterLoad();
                };

                if (!snapshot.hasChildren()) return showInfo();

                const records = Object.keys(snapshot.val());

                if (!records.length) return showInfo();

                records.forEach(uid => {
                    if (snapshot.val()[uid].time < leaderboard.best.time || !leaderboard.best.time) {
                        leaderboard.best = {
                            name: snapshot.val()[uid].name,
                            time: snapshot.val()[uid].time,
                        };
                    }
                });

                showPopup(`<span class='blue'>${leaderboard.best.name}</span><br>solved all puzzles in<br><span class='gold'>${leaderboard.best.time}</span> seconds`, 'Play', () => {
                    document.body.removeChild(popup.element);
                    toggleFullScreen();
                });
                afterLoad();
            });
        },
        add: (newScore) => {
            let sameUser;
            if (!newScore || newScore < 0) throw new Error('New score must be a non-zero positive integer.');

            const ref = fire.child(profile.lb_user_id);
            ref.transaction((currentData) => {
                sameUser = Boolean(currentData);
                return {
                    name: profile.name,
                    email: profile.email,
                    time: currentData ? Math.min(currentData.time, newScore) : newScore,
                };
            }, () => {
                if (newScore <= leaderboard.best.time || !leaderboard.best.time) {
                    const p = sameUser ? 'beaten your own record' : `defeated<br><span class='blue'>${leaderboard.best.name}</span><br>to become the champion`;
                    showPopup(`You finished in<br><span class='gold'>${newScore}</span> seconds<br><br>Congratulations! You've ${p}!`, 'Play again', () => window.location.reload(true));
                    leaderboard.best = {
                        name: profile.name,
                        time: newScore,
                    };
                }
                else {
                    showPopup(`You finished in<br><span class='green'>${newScore}</span> seconds<br><br>The current best score is<br><span class='gold'>${leaderboard.best.time}</span> seconds`);
                    alert(`You finished in ${newScore} seconds, ${newScore - leaderboard.best.time}s more than the fastest solver.`);
                }
            });
        },
    };

// ===== FUNCTIONS ===== //

function setBackground(ir, wr) {
    if (!Array.from(document.body.children).includes(bg.wrapper)) {
        bg.wrapper = document.createElement('div');
        bg.image = document.createElement('img');

        bg.wrapper.appendChild(bg.image);
        document.body.appendChild(bg.wrapper);

        style([bg.wrapper], {
            position: 'absolute',
            left: '0',
            top: '0',
            width: '100%',
            height: '100%',
            background: 'black',
            opacity: '0.75',
            overflow: 'hidden',
            z_index: '-2',
        });
    }

    bg.image.src = image.src;

    style([bg.image], {
        position: 'relative',
        width: window.innerWidth > bg.image.width ? '110%' : 'initial',
        height: window.innerHeight > bg.image.height ? '110%' : 'initial',
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        filter: 'grayscale(0.5) blur(10px)',
    });
}

function loadImage() {
    if (!image) image = document.createElement('img');

    image.src = levels[nth].link;
    info.textContent = `Loading the ${rank(nth + 1)} puzzle...`;

    image.onload = () => {
        const
            ir = image.width / image.height,
            wr = window.innerWidth / window.innerHeight;
        
        resolution = [
            ir >= 0 ? Math.round(levels[nth].grid * ir) : levels[nth].grid,
            ir >= 0 ? levels[nth].grid : Math.round(levels[nth].grid * ir),
        ];
        setBackground(ir, wr);
        initialze();
        info.textContent = `You're solving the ${rank(nth + 1)} puzzle.`;
    };
}

function initialze() {
    generatePuzzle();
    shuffle(puzzle);

    spare.style.height = `${window.innerHeight - spare.offsetTop}px`;

    puzzle.forEach((piece, i) => {
        puzzleContainer.appendChild(piece);
        piece.location = puzzleGrid[i];
        if (Math.random() > 0.7) {
            puzzleGrid[i].isEmpty = false;
            piece.style.left = puzzleGrid[i].x;
            piece.style.top = puzzleGrid[i].y;
        } else {
            puzzleGrid[i].isEmpty = true;
            piece.style.left = range(10, puzzleContainer.offsetWidth - piece.offsetWidth - 10) + 'px';
            piece.style.top = range(spare.offsetTop, window.innerHeight - puzzleContainer.offsetTop - piece.offsetHeight) - 20 + 'px';
        }
    });
}

function generatePuzzle() {
    const
        hr = window.innerWidth * sizeRatio / image.width,
        vr = window.innerHeight * sizeRatio / image.height,
        r = Math.min(hr, vr);

    // loop to create all pieces in the puzzle
    for (let i = 0; i < resolution[0] * resolution[1]; i++) {
        const
            piece = document.createElement('div'),
            x = i % resolution[0] * (image.width * r / resolution[0]),
            y = Math.floor(i / resolution[0]) * (image.height * r / resolution[1]);

        piece.id = `piece${i}`;
        piece.className = "piece";
        piece.style.width = `${image.width * r / resolution[0]}px`;
        piece.style.height = `${image.height * r / resolution[1]}px`;
        piece.style.backgroundImage = `url(${image.src})`;
        piece.style.backgroundSize = `${image.width * r}px  ${image.height * r}px`;
        piece.style.backgroundPosition = `-${x}px -${y}px`;
        piece.style.zIndex = '0';

        // store each piece in an array
        puzzle.push(piece);
        puzzleGrid.push({ x: `${x}px`, y: `${y}px`, isEmpty: true, index: i });
    }

    puzzleContainer.style.width = `${image.width * r}px`;
    puzzleContainer.style.height = `${image.height * r}px`;
}

function shuffle(array) {
    let counter = array.length;

    // While there are elements in the array
    while (counter > 0) {
        // Pick a random index
        let index = Math.floor(Math.random() * counter);

        // Decrease counter by 1
        counter--;

        // And swap the last element with it
        let temp = array[counter];
        array[counter] = array[index];
        array[index] = temp;
    }
}

function selectPiece(target) {
    if (!Number.isInteger(activeIndex)) {
        activeIndex = puzzle.includes(target) ? puzzle.indexOf(target) : null;

        if (Number.isInteger(activeIndex)) {
            console.clear();
            console.log('Active:', puzzle[activeIndex].id, `puzzle[${puzzle[activeIndex].location.index}]`);

            puzzle.forEach(piece => {
                if (piece) piece.style.zIndex = '0';
            });
            puzzle[activeIndex].style.zIndex = '1';

            if (puzzleGrid[activeIndex].isEmpty) secondaryLocation = { x: puzzle[activeIndex].offsetLeft + 'px', y: puzzle[activeIndex].offsetTop + 'px' };

            let s = puzzleGrid[activeIndex].isEmpty;
            puzzleGrid[activeIndex].isEmpty = true;

            console.log('Picked up from', puzzleGrid[activeIndex], puzzleGrid[activeIndex].isEmpty);
            console.log(`puzzle[${activeIndex}].isEmpty: ${s} => ${puzzleGrid[activeIndex].isEmpty}`);
        }
    }
}

function movePiece(clientX, clientY) {
    if (Number.isInteger(activeIndex)) {
        const
            offsetX = clientX - puzzleContainer.offsetLeft,
            offsetY = clientY - puzzleContainer.offsetTop,
            piece = puzzle[activeIndex].getBoundingClientRect();

        activeGrid = puzzleGrid[Math.floor(offsetY / piece.height) * resolution[0] + Math.floor(offsetX / piece.width)];

        puzzle[activeIndex].style.transitionDuration = '0s';
        puzzle[activeIndex].style.left = `${offsetX - puzzle[activeIndex].offsetWidth / 2}px`;
        puzzle[activeIndex].style.top = `${offsetY - puzzle[activeIndex].offsetHeight / 2}px`;

        console.clear();
        console.log('Picked up from', puzzleGrid[activeIndex]);
        console.log(`puzzle[${activeIndex}].isEmpty: ${puzzleGrid[activeIndex].isEmpty}`);

        if (activeGrid)
            console.log('Hovering above', activeGrid);
        else
            console.log('Hovering outside puzzle.');
    }
}

function dropPiece(clientX, clientY) {
    if (Number.isInteger(activeIndex)) {
        if (activeGrid && activeGrid.isEmpty) {
            placePiece(activeGrid);
        } else {
            const
                h = clientX >= spare.offsetLeft && clientX <= spare.offsetLeft + spare.offsetWidth,
                v = clientY >= spare.offsetTop + puzzle[activeIndex].offsetHeight / 2 && clientY <= spare.offsetTop + spare.offsetHeight;

            // if dropped inside the blue area
            if (h && v) {
                placePiece({ x: `${puzzle[activeIndex].offsetLeft}px`, y: `${puzzle[activeIndex].offsetTop}px` });
                console.log('Dropped in spare box.');
            } else {
                placePiece(secondaryLocation || puzzle[activeIndex].location);
                secondaryLocation = null;
            }
        }
        activeIndex = null;
    }

    // const selection = window.getSelection();
    // if (selection.type == 'Range') selection.removeAllRanges();
}

function placePiece(target) {
    puzzle[activeIndex].style.transitionDuration = '0.2s';
    puzzle[activeIndex].style.left = target.x;
    puzzle[activeIndex].style.top = target.y;

    if (target.hasOwnProperty('index')) {
        let s = puzzleGrid[target.index].isEmpty;
        puzzleGrid[target.index].isEmpty = false;
        console.log(`puzzleGrid[${target.index}].isEmpty: ${s} => ${puzzleGrid[target.index].isEmpty}`);

        s = puzzle[activeIndex].location;
        puzzle[activeIndex].location = target;
        console.log(`puzzle[${activeIndex}].location:`, s, '=>', puzzle[activeIndex].location);

        // swap pieces in the puzzle array
        const swap = puzzle[target.index];
        puzzle[target.index] = puzzle[activeIndex];
        puzzle[activeIndex] = swap;

        checkPuzzle();
    }
}

function checkPuzzle() {
    let pass = puzzle.every((piece, i) => {
        return piece.id == `piece${i}`;
    });

    if (pass && puzzleGrid.every(grid => !grid.isEmpty)) {
        if (nth < levels.length - 1) {
            showPopup(`Well done! You solved the ${rank(++nth)} puzzle!`, 'Next puzzle', () => {
                document.body.removeChild(popup.element);
                resetPuzzle();
            });
        }
        else {
            leaderboard.add(Math.ceil((Date.now() - time) / 1000));
        }
    }
}

function resetPuzzle() {
    puzzle.forEach(piece => puzzleContainer.removeChild(piece));

    puzzle = [];
    puzzleGrid = [];
    activeIndex = null;
    activeGrid = null;
    mouseDown = false;

    loadImage();
}

function toggleFullScreen() {
    var doc = window.document;
    var docEl = doc.documentElement;

    var requestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;
    var cancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;

    if (!doc.fullscreenElement && !doc.mozFullScreenElement && !doc.webkitFullscreenElement && !doc.msFullscreenElement) {
        requestFullScreen.call(docEl);
    }
    else {
        cancelFullScreen.call(doc);
    }
}

function showPopup(messageContent, buttonText, action) {
    const
        wrapper = document.createElement('div'),
        logo = document.createElement('img'),
        message = document.createElement('h2'),
        button = document.createElement('button');

    popup = {
        element: document.createElement('div'),
        message: message,
        button: button,
    };

    logo.src = 'https://app.bsdlaunchbox.com/resources/bsdlogo.png';
    message.innerHTML = messageContent;
    
    wrapper.appendChild(message);

    if (buttonText) {
        button.textContent = buttonText;
        button.onclick = action;
        wrapper.appendChild(button);
    }

    document.body.appendChild(popup.element);
  	popup.element.appendChild(wrapper);
    popup.element.appendChild(logo);
    
  	style([popup.element], {
        position: 'absolute',
        top: '0',
        width: `${window.innerWidth}px`,
        height: `${window.innerHeight}px`,
        background_color: 'rgba(255, 255, 255, 0.8)',
        z_index: '2',
    });
  
    style([wrapper], {
        position: 'absolute',   
        width: `${window.innerWidth - 50}px`,
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        border_radius: '10px',
        padding: '0 20px 20px 20px',
        background_color: 'rgba(0, 0, 0, 0.8)',
        box_sizing: 'border-box',
    });
    
    style([message], {
        margin_top: '0',
        font_family: 'Monospace',
        color: 'ghostwhite',
        line_height: '1.5em',
    });
    
    if (buttonText) style([button], {
        border: 'none',
        border_radius: `${button.offsetHeight / 2}px`,
        padding: '5px 10px',
        cursor: 'pointer',
        outline: 'none',
        font_family: 'Monospace',
        font_size: '1.2em',
        color: 'black',
        background_color: 'ghostwhite',
    });
    
    logo.onload = () => {
        const sizeRatio = window.innerWidth * 0.15 / logo.offsetWidth;
        style([wrapper], {padding_top: `${10 + (logo.offsetHeight / 2) * sizeRatio}px`});
        style([logo], {
            position: 'absolute',
            left: '50%',
            transform: `translateX(-50%) scale(${sizeRatio}) `,
            top: `${wrapper.offsetTop - (wrapper.offsetHeight / 2) - (logo.offsetHeight / 2)}px`,
        });
    }
}

// ===== EVENTS ===== //

window.onresize = () => style([spare], {height: `${window.innerHeight - spare.offsetTop}px`});

window.onload = () => {
    loadImage();

    profile = getBSDProfile();

    if (profile) leaderboard.load(() => time = Date.now());
    else {
        showPopup('You must log in with a Launchbox account to play', 'Go to Launchbox', () => window.open('https://app.bsdlaunchbox.com'));
        document.onvisibilitychange = () => {
            if (document.visibilityState === 'visible') window.location.reload(true);
        }
    }
};

window.ontouchstart = (evt) => {
    if (evt.touches.length === 1) selectPiece(evt.target);
};

window.onmousedown = (evt) => {
    mouseDown = true;
    selectPiece(evt.target);
};

window.ontouchmove = (evt) => {
    if (evt.touches.length === 1) movePiece(evt.touches[0].clientX, evt.touches[0].clientY);
    evt.preventDefault();
};

window.onmousemove = (evt) => {
    if (mouseDown) movePiece(evt.clientX, evt.clientY);
};

window.ontouchend = (evt) => {
    if (!activeIndex && !evt.touches.length) {
        const time = Date.now();
        if (time - tap < 200) toggleFullScreen();
        tap = time;
    }

    dropPiece(evt.changedTouches[0].clientX, evt.changedTouches[0].clientY);
};

window.onmouseup = (evt) => {
    mouseDown = false;
    dropPiece(evt.clientX, evt.clientY);
};

// ===== UTILITY ===== //

function rank(n) {
    return n > 0 ?
        n + (/1$/.test(n) && n != 11 ? 'st' : /2$/.test(n) && n != 12 ? 'nd' : /3$/.test(n) && n != 13 ? 'rd' : 'th') :
        n;
}

function range(min, max, int = false) {
    const r = Math.random() * (max - min) + min;
    return int ? Math.round(r) : r;
}

function style(elem, declarations) {
    Object.keys(declarations).forEach(d => {
        elem.forEach(e => {
            e.style[d.replace(/_/, '-')] = declarations[d];
        });
    });
}

function getBSDProfile() {
    var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

    function InvalidCharacterError(message) {
        this.message = message;
    }

    InvalidCharacterError.prototype = new Error();
    InvalidCharacterError.prototype.name = 'InvalidCharacterError';

    function polyfill(input) {
        var str = String(input).replace(/=+$/, '');
        if (str.length % 4 == 1) {
            throw new InvalidCharacterError("'atob' failed: The string to be decoded is not correctly encoded.");
        }
        for (
            // initialize result and counters
            var bc = 0, bs, buffer, idx = 0, output = '';
            // get next character
            buffer = str.charAt(idx++);
            // character found in table? initialize bit storage and add its ascii value;
            ~buffer && (bs = bc % 4 ? bs * 64 + buffer : buffer,
                // and if not first of each 4 characters,
                // convert the first 8 bits to one ascii character
                bc++ % 4) ? output += String.fromCharCode(255 & bs >> (-2 * bc & 6)) : 0
        ) {
            // try to find character in table (0-63, not found => -1)
            buffer = chars.indexOf(buffer);
        }
        return output;
    }

    function b64DecodeUnicode(str) {
        return decodeURIComponent(atob(str).replace(/(.)/g, function (m, p) {
            var code = p.charCodeAt(0).toString(16).toUpperCase();
            if (code.length < 2) {
                code = '0' + code;
            }
            return '%' + code;
        }));
    }

    function base64_url_decode(str) {
        var output = str.replace(/-/g, "+").replace(/_/g, "/");
        switch (output.length % 4) {
            case 0:
                break;
            case 2:
                output += "==";
                break;
            case 3:
                output += "=";
                break;
            default:
                throw "Illegal base64url string!";
        }

        try {
            return b64DecodeUnicode(output);
        } catch (err) {
            return atob(output);
        }
    };

    function InvalidTokenError(message) {
        this.message = message;
    }

    InvalidTokenError.prototype = new Error();
    InvalidTokenError.prototype.name = 'InvalidTokenError';

    function decodeJwt(token, options) {
        if (typeof token !== 'string') {
            throw new InvalidTokenError('Invalid token specified');
        }

        options = options || {};
        var pos = options.header === true ? 0 : 1;
        try {
            return JSON.parse(base64_url_decode(token.split('.')[pos]));
        } catch (e) {
            throw new InvalidTokenError('Invalid token specified: ' + e.message);
        }
    };

    var token = parent.localStorage.getItem('id_token');
    if (token != null) {
        var decoded = decodeJwt(token);
        if (decoded != null) {
            return {
                name: decoded.name,
                email: decoded.email,
                picture: decoded.picture,
                lb_user_id: decoded.lb_user_id,
                auth0_user_id: decoded.user_id,
                organisations: decoded.organisations
            };
        }
    }
    return null;
}