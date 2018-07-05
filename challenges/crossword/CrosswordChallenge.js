// window.onload = () => {

//     //document.body.style.backgroundColor = "black";

//     // const box = new CrosswordBox({x: 0, y: 0}, 'A');
//     // box.init(document.body);

//     // const box2 = new CrosswordBox({x: -1, y: 0}, 'B');
//     // box2.init(document.body);

//     const test1 = ["blink", "minister", "drop", "size", "gaping"];
//     const test2 = ["swanky", "energetic", "acidic", "honey", "four"];
//     const test3 = ["distribution", "announce", "nervous", "calculator", "accessible"];

//     const test4 = ["church", "medical", "mark", "spade", "scared", "bit", "trite", "dusty", "lamp", "license"];
//     const test5 = ["miss", "delicious", "hole", "birds", "itch", "military", "lunch", "excited", "flag", "scandalous"];

//     const test6 = ["var", "const", "let", "foo", "thrown"];
//     const test7 = ["add", "minus", "times", "divide", "equal"]

//     const test8 = ["silent", "rabbits", "metal", "addicted", "clever", "back", "develop", "noxious", "cracker", "side", "uninterested", "ready", "influence", "ashamed", "thirsty", "shock", "work", "even", "summer", "eager"];

//     const hints1 = ["In the _ of an eye", "preach", "_ the bass", "fun_", "wide open"];
//     const hints4 = ["Where sinners perish", "_ ointment", "_ my words", "shovel", "less than terrified", "eighth of a byte", "overused/unoriginal", "accumulated filth", "illumination device", "driver's _"];
//     const hints5 = ["Swiss _", "very tasty", "head like a _", "multiple fowl", "scratch this", "main focus of expenditure (USA)", "before dinner", "pumped", "red _", "gossip is often _"];
//     const hints8 = ["a", "a", "a", "a", "a", "a", "a", "a", "a", "a", "a", "a", "a", "a", "a", "a", "a", "a", "a", "a"];

//     const crosswordChallenge = new CrosswordChallenge();
//     crosswordChallenge.content = {
//         words: test8,
//         hints: hints8
//     };
//     crosswordChallenge.shuffleWords = true;
//     crosswordChallenge.easyMode = true;
//     crosswordChallenge.wordBankEnabled = true;
//     crosswordChallenge.start();
//     //crosswordChallenge.preview();

// }

////////////////////////////////////////////////////////////

const Direction = Object.freeze({ horizontal: 1, vertical: 2, across: 3, down: 4 });

class CrosswordChallenge {

    constructor() {

        this.content = null;

        this.words = null;
        this.hints = null;

        this.shuffleWords = true; // Shuffles the array of words each time the crossword loads, if true
        this.easyMode = false; // Highlights completed words in green, if true
        this.randomLetterFill = true; // Fills in random letters from words to make crossword easier, if true
        this.wordBankEnabled = false; // Allows users to see a word bank, if true

    }

    validateContent() {

        if (!this.content) {
            const contentAlert = new Alert("You are missing the data to be passed in by CrosswordChallenge.content");
            contentAlert.show();
        }

        if ('words' in this.content) {
            this.words = this.content.words;
        } else {
            const contentAlert = new Alert("You are missing the 'words' data in the content object");
            contentAlert.show();
        }

        if ('hints' in this.content) {
            this.hints = this.content.hints;
        } else {
            const contentAlert = new Alert("You are missing the 'hints' data in the content object");
            contentAlert.show();
        }

        if (this.words.length < 5) {
            const wordCountAlert = new Alert("You must provide at least five words for the crossword");
            wordCountAlert.show();
        }

        let hasLongWord = false;

        this.words.forEach(word => {

            if (word.length < 3) {
                const wordLengthAlert = new Alert("Each word must have at least three letters");
                wordLengthAlert.show();
            } else if (word.length > 5) {
                hasLongWord = true;
            }

        });

        if (!hasLongWord) {
            const longWordAlert = new Alert("You must have at least one word with six or more letters");
            longWordAlert.show();
        }

        if (this.words.length !== this.hints.length) {

            const lengthMismatchAlert = new Alert("You must have the same number of hints as words");
            lengthMismatchAlert.show();

        }

    }

    start(preview = false) {

        this.validateContent();

        if (this.shuffleWords) {

            this.wordHintDict = {};

            // Shuffle the words and the hints (so they still match by index)
            for (let i = 0; i < this.words.length; i++) {

                this.wordHintDict[this.words[i]] = this.hints[i];

            }

            const shuffledWords = Object.keys(this.wordHintDict);
            shuffleArray(shuffledWords);

            let shuffledHints = [];

            shuffledWords.forEach(word => {
                shuffledHints.push(this.wordHintDict[word]);
            })

            const crossword = new Crossword(shuffledWords, shuffledHints, [this.easyMode, this.randomLetterFill, this.wordBankEnabled, preview], this.wordHintDict);
            crossword.generatePuzzle();

        } else {

            const crossword = new Crossword(this.words, this.hints, [this.easyMode, this.randomLetterFill, this.wordBankEnabled, preview]);
            crossword.generatePuzzle();

        }

    }

    preview() { // Shows the completed crossword, uneditable, if true
        this.start(true);
    }


}

class Crossword {

    constructor(words, hints, options, wordHintDict = null) {

        this.words = words;
        this.hints = hints;

        this.wordHintDict = wordHintDict;

        this.easyMode = options[0];
        this.randomLetterFill = options[1];
        this.wordBank = options[2];
        this.preview = options[3];

        this.height = null;
        this.width = null;

        this.placedSequences = null;
        this.unplacedWordCount = {};

        this.acrossSequences = [];
        this.downSequences = [];

        this.board = new CrosswordBoard(this.easyMode, this.wordBank);

    }

    generatePuzzle() {

        let createdPuzzle;

        if (!this.wordHintDict) {

            let tryCount = 0;

            while (tryCount < 100) {

                this.board.sequences = [];
                this.board.boxes = [];

                // Start the puzzle with each word until one configuration works
                createdPuzzle = this.words.some((word, i) => {

                    const unusedWords = this.words.slice();

                    // Remove current base-word from the list
                    unusedWords.splice(i, 1);

                    const sequence = new CrosswordSequence(word, { x: 0, y: 0 }, Direction.horizontal, this.randomLetterFill, this.preview);

                    return this.getNextSequencePosition([sequence], unusedWords);

                });

                if (createdPuzzle) {
                    break;
                }

                shuffleArray(this.words);

                tryCount += 1;

            }

        } else {

            // Start the puzzle with each word until one configuration works
            createdPuzzle = this.words.some((word, i) => {

                const unusedWords = this.words.slice();

                // Remove current base-word from the list
                unusedWords.splice(i, 1);

                const sequence = new CrosswordSequence(word, { x: 0, y: 0 }, Direction.horizontal, this.randomLetterFill, this.preview);

                return this.getNextSequencePosition([sequence], unusedWords);

            });

        }

        let maxUnplaced = 0;
        let troubleWords = [];

        Object.keys(this.unplacedWordCount).forEach(key => {

            if (this.unplacedWordCount[key] > maxUnplaced) {
                troubleWords = [key];
                maxUnplaced = this.unplacedWordCount[key];
            } else if (this.unplacedWordCount[key] === maxUnplaced) {
                troubleWords.push(key);
            }

        });

        if (!createdPuzzle) {
            const failedCreationAlert = new Alert("Could not find valid crossword configuration. Had most trouble placing: " + troubleWords);
            failedCreationAlert.show();
        }

        this.board.centerBoard();

        if (this.wordBank) {
            let shuffledWords = this.words.slice();
            shuffleArray(shuffledWords);

            let wordBankText = "WORDBANK:\n\n";

            shuffledWords.forEach(word => {
                wordBankText += `${word}\n`;
            })

            this.board.addWordBankContent(wordBankText);

        }

        let sequenceNumber = 1;

        const xRange = this.board.xRange;
        const yRange = this.board.yRange;
        for (let i = yRange[0]; i <= yRange[1]; i++) {

            for (let j = xRange[0]; j <= xRange[1]; j++) {

                const position = { x: j, y: i };
                const sequences = this.board.hasSequenceAt(position);

                sequences.forEach(sequence => {
                    sequence.setSequenceNumber(sequenceNumber);
                });

                if (sequences.length !== 0) {
                    sequenceNumber += 1;
                }

            }

        }

        this.placedSequences.sort(function (a, b) { if (a.getSequenceNumber() > b.getSequenceNumber()) return 1; else return -1 })

        this.placedSequences.forEach(sequence => {
            let boxNumber;
            if (sequence.direction === Direction.horizontal) {
                this.acrossSequences.push(sequence);

                this.words.forEach((word, i) => {
                    if (word === sequence.getWord()) {
                        this.board.addHint(sequence.getSequenceNumber(), this.hints[i], Direction.across);
                    }
                });

            } else if (sequence.direction === Direction.vertical) {
                this.downSequences.push(sequence);

                this.words.forEach((word, i) => {
                    if (word === sequence.getWord()) {
                        this.board.addHint(sequence.getSequenceNumber(), this.hints[i], Direction.down);
                    }
                });

            }

            sequence.show();

        });

    }

    getNextSequencePosition(placedSequences, unusedWords) {

        const foundConfiguration = unusedWords.some(word => {

            // Go through the words currently placed in the puzzle, looking for a place for the new word
            return placedSequences.some(sequence => {

                const overlaps = sequence.hasOverlap(word);

                // Loop through the possible overlap spaces on the target sequence
                return overlaps.some(overlap => {

                    const letter = overlap.letter;
                    const position = overlap.position;

                    for (let i = 0; i < word.length; i++) {
                        const aLetter = word[i];
                        if (aLetter === letter) {

                            const newSequence = sequence.generateAdjacentSequence(position, word, i, this.randomLetterFill, this.preview);

                            const isValid = this.isValidSequencePosition(placedSequences, sequence, newSequence);

                            if (isValid) {

                                const newPlacedSequences = placedSequences.slice();
                                newPlacedSequences.push(newSequence);

                                const newUnusedWords = unusedWords.slice();
                                const index = newUnusedWords.indexOf(word);
                                newUnusedWords.splice(index, 1);

                                if (newUnusedWords.length === 0) {
                                    this.placedSequences = newPlacedSequences;
                                    this.board.addSequences(this.placedSequences);
                                    return true;
                                }

                                return this.getNextSequencePosition(newPlacedSequences, newUnusedWords);

                            }

                        }

                        if (i === word.length - 1) {
                            return false;
                        }

                    }

                })

            })
        })

        if (!foundConfiguration) {
            unusedWords.forEach(word => {
                this.unplacedWordCount[word] = this.unplacedWordCount[word] ? this.unplacedWordCount[word] + 1 : 1;
            });
        }
        return foundConfiguration;

    }

    isValidSequencePosition(placedSequences, anchorSequence, newSequence) {

        return placedSequences.every(sequence => {

            const doesTouch = sequence.doesTouch(newSequence);

            // If the new sequence "touches" any other previously-placed sequence, apart from the one it attaches to
            if (doesTouch && sequence !== anchorSequence) {
                return false;
            } else {
                return true;
            }

        })

    }

    horizontalComparator(a, b) {
        const aPos = a.getPosition();
        const bPos = b.getPosition();
        if (aPos.x < bPos.x) {
            return -1;
        } else if (aPos.x > bPos.x) {
            return 1;
        } else { // If x's are equal
            if (aPos.y < bPos.y) {
                return -1;
            } else {
                return 1;
            }
        }
    }

    verticalComparator(a, b) {
        const aPos = a.getPosition();
        const bPos = b.getPosition();
        if (aPos.y < bPos.y) {
            return -1;
        } else if (aPos.y > bPos.y) {
            return 1;
        } else { // If x's are equal
            if (aPos.x < bPos.x) {
                return -1;
            } else {
                return 1;
            }
        }
    }

}

class CrosswordBoard {

    constructor(easyMode, wordBank) {

        this.easyMode = easyMode;
        this.wordBank = wordBank;

        this.boxes = [];

        this.sequences = [];

        this.maxX = 0;
        this.minX = 0;
        this.maxY = 0;
        this.minY = 0;

        this.minXBox = null;
        this.minYBox = null;

        this.pieceSize = 0;

        this.backdrop = null;
        this.hintDiv = null;
        this.wordBankDiv = null;
        this.blurDiv = null;

        this.typingVelocity = Direction.across;

        document.children[0].style.height = '100%';
        document.body.style.height = '100%';
        document.body.style.margin = "0";
        document.body.style.padding = "0";
        document.body.style.overflow = "hidden";

        if (this.wordBank) {
            this.createWordBank();
        }

    }

    addSequence(sequence) {
        this.sequences.push(sequence);
        sequence.getBoxes().forEach(box => {
            this.boxes.push(box);
        });
    }

    addSequences(sequences) {
        sequences.forEach(sequence => {
            this.addSequence(sequence);
        });
    }

    centerBoard() {

        const boardDimensions = this.dimensions;


        const screenWidth = document.body.getBoundingClientRect().width;
        const screenHeight = document.body.getBoundingClientRect().height;

        const boardAspectRatio = boardDimensions.width / boardDimensions.height;
        const screenAspectRatio = screenWidth / screenHeight;

        let hintDivWidth = 0;


        if (boardAspectRatio > screenAspectRatio * 1.3333) { // If the puzzle is wider than the screen
            this.pieceSize = screenWidth / boardDimensions.width;
            hintDivWidth = screenWidth;
            this.giveBoxBoard();
            this.createBackdrop(screenWidth, this.pieceSize * boardDimensions.height);
            this.createHintDiv(hintDivWidth, screenHeight - this.pieceSize * boardDimensions.height);
        } else if (boardAspectRatio < screenAspectRatio * 1.3333) { // If the puzzle is taller than the screen
            this.pieceSize = (0.75 * screenHeight) / boardDimensions.height;
            hintDivWidth = this.pieceSize * boardDimensions.width;
            this.giveBoxBoard();
            this.createBackdrop(hintDivWidth, 0.75 * screenHeight);
            this.createHintDiv(hintDivWidth, screenHeight / 4);
        }

    }

    giveBoxBoard() {
        this.boxes.forEach(box => {
            box.setBoard(this);
        });
    }

    setOffset() {

        const puzzleOrigin = { left: this.minXBox.domElement.offsetLeft, top: this.minYBox.domElement.offsetTop };

        this.boxes.forEach(box => {
            box.setOffset(puzzleOrigin.x, puzzleOrigin.y);
        });

    }

    createWordBank() {

        const wordBank = document.createElement("button");

        const bankCSS = {
            position: 'absolute',
            width: `${window.innerWidth / 2}px`,
            height: `${window.innerHeight / 2}px`,
            fontSize: '16px',
            fontFamily: 'arial',
            backgroundColor: '#D3D3D3',
            whiteSpace: 'pre',
            textAlign: 'center',
            zIndex: '3',
            overflowY: 'scroll'
        }

        Object.assign(wordBank.style, bankCSS);

        wordBank.style.left = `${window.innerWidth / 4 - wordBank.offsetWidth / 2}px`;
        wordBank.style.top = `${window.innerHeight / 4 - wordBank.offsetHeight / 2}px`;

        this.wordBankDiv = wordBank;

        const blurDiv = document.createElement("div");

        const blurCSS = {
            position: "absolute",
            width: "100%",
            height: "100%",
            backgroundColor: "white",
            opacity: "0.7",
            zIndex: "2"
        }
        Object.assign(blurDiv.style, blurCSS);

        this.blurDiv = blurDiv;

        const bankButton = document.createElement("button");
        bankButton.textContent = "Show Word Bank";

        document.body.appendChild(bankButton);

        bankButton.style.position = 'absolute';
        bankButton.style.left = '20px';
        bankButton.style.top = '20px';
        bankButton.style.zIndex = '2';

        bankButton.onclick = () => {
            this.showWordBank();
        }

        wordBank.onclick = () => {
            this.removeWordBank();
        }

    }

    addWordBankContent(content) {
        this.wordBankDiv.textContent = content;
    }

    showWordBank() {
        document.body.appendChild(this.wordBankDiv);
        document.body.appendChild(this.blurDiv);
    }

    removeWordBank() {
        this.wordBankDiv.remove();
        this.blurDiv.remove();
    }

    createBackdrop(width, height) {

        const backdrop = document.createElement("div");

        backdrop.style.position = "absolute";
        backdrop.style.width = `${width}px`;
        backdrop.style.height = `${height}px`;
        backdrop.style.backgroundColor = "black";

        document.body.appendChild(backdrop);

        backdrop.style.left = `${document.body.getBoundingClientRect().width / 2 - backdrop.offsetWidth / 2}px`;
        backdrop.style.top = `0px`;

        this.backdrop = backdrop;

        this.backdrop.onkeydown = () => {

            if (!document.activeElement || !document.activeElement.box) {
                return;
            }
            const position = document.activeElement.box.getPosition();

            let newPosition = {};
            if (event.keyCode === 37) {
                newPosition = {
                    x: position.x - 1,
                    y: position.y
                }
            } else if (event.keyCode === 38) {
                newPosition = {
                    x: position.x,
                    y: position.y - 1
                }
            } else if (event.keyCode === 39) {
                newPosition = {
                    x: position.x + 1,
                    y: position.y
                }
            } else if (event.keyCode === 40) {
                newPosition = {
                    x: position.x,
                    y: position.y + 1
                }
            }

            const adjacentBox = this.hasBoxAt(newPosition);
            if (adjacentBox) {
                adjacentBox.domElement.children[0].focus();
            }

        }

        this.backdrop.onkeyup = () => {

            if (this.easyMode) {
                this.checkForCompletedSequences();
            }

        }

    }

    createHintDiv(width, height) {

        const hintDiv = document.createElement("div");

        const hintCSS = {
            position: 'absolute',
            width: `${width}px`,
            height: `${height}px`,
            backgroundColor: '#D3D3D3',
            zIndex: 1
        }

        Object.assign(hintDiv.style, hintCSS);

        document.body.appendChild(hintDiv);
        this.hintDiv = hintDiv;

        hintDiv.style.left = `${this.backdrop.offsetLeft}px`;
        hintDiv.style.top = `${this.backdrop.offsetTop + this.backdrop.offsetHeight}px`;

        const acrossHintDiv = document.createElement("div");
        const downHintDiv = document.createElement("div");
        acrossHintDiv.textContent = "Across:\n";
        downHintDiv.textContent = "Down:\n";

        const css = {
            position: 'absolute',
            width: `${width / 2}px`,
            height: `${height}px`,
            fontFamily: 'arial',
            fontSize: '18px',
            overflowY: 'scroll',
            overflowX: 'scroll',
            whiteSpace: 'pre',
            border: '1px solid black',
            textAlign: 'center'
        }

        Object.assign(acrossHintDiv.style, css);
        Object.assign(downHintDiv.style, css);

        hintDiv.appendChild(acrossHintDiv);
        hintDiv.appendChild(downHintDiv);

        acrossHintDiv.style.left = '0px';
        acrossHintDiv.style.top = '0px';

        downHintDiv.style.left = `${width / 2}px`;
        downHintDiv.style.top = '0px';

    }

    addHint(number, hint, direction) {

        if (direction === Direction.across) {

            const acrossDiv = this.hintDiv.children[0];
            acrossDiv.textContent += number + ": " + hint + '\n';

        } else if (direction === Direction.down) {

            const downDiv = this.hintDiv.children[1];
            downDiv.textContent += number + ": " + hint + '\n';

        }

    }

    checkForWin() {

        const didWin = this.sequences.every(sequence => {

            return sequence.getBoxes().every(box => {

                if (box.correctLetter.toUpperCase() === box.letter.toUpperCase()) {
                    return true;
                } else {
                    return false;
                }

            })

        });

        if (didWin) {
            this.showWinMessage();
        }

    }

    checkForCompletedSequences() {

        this.boxes.forEach(box => {
            box.updateColor('black');
        });

        this.sequences.forEach(sequence => {

            const isCompletedSequence = sequence.getBoxes().every(box => {
                if (box.getLetter().toUpperCase() === box.getCorrectLetter().toUpperCase()) return true;
                else return false;
            });

            if (isCompletedSequence) {
                sequence.getBoxes().forEach(box => {
                    box.updateColor('green');
                });
            }

            if (document.activeElement && document.activeElement.box) {
                const letterDiv = document.activeElement;

                var range = document.createRange();
                var sel = window.getSelection();
                range.setStart(letterDiv, 0);
                range.collapse(true);
                sel.removeAllRanges();
                sel.addRange(range);
                letterDiv.focus();

            }

        });

    }

    showWinMessage() {

        const winMessage = document.createElement("div");
        winMessage.textContent = "Congrats! You finished the puzzle!";

        const winCSS = {
            position: 'absolute',
            width: `${2 * window.innerWidth / 3}px`,
            height: `${200}px`,
            backgroundColor: 'white',
            borderRadius: '50px',
            border: '1px solid black',
            zIndex: '3',
            fontSize: '20px',
            fontFamily: 'arial',
            textAlign: 'center',
            padding: '20px 0'
        }

        Object.assign(winMessage.style, winCSS);

        document.body.appendChild(winMessage);

        const celebrateImg = document.createElement("img");
        celebrateImg.src = "https://images.emojiterra.com/mozilla/512px/1f389.png";

        const imgCSS = {
            position: 'absolute',
            width: '100px',
            height: '100px'
        }

        Object.assign(celebrateImg.style, imgCSS);

        winMessage.appendChild(celebrateImg);

        celebrateImg.style.left = `${winMessage.offsetWidth / 2 - celebrateImg.offsetWidth / 2}px`;
        celebrateImg.style.top = `${winMessage.offsetHeight / 2 - celebrateImg.offsetHeight / 2}px`;

        winMessage.style.left = `${window.innerWidth / 2 - winMessage.offsetWidth / 2}px`;
        winMessage.style.top = `${window.innerHeight / 2 - winMessage.offsetHeight / 2}px`;

        const blurDiv = document.createElement("div");

        const blurCSS = {
            position: "absolute",
            width: "100%",
            height: "100%",
            backgroundColor: "white",
            opacity: "0.7",
            zIndex: "2"
        }
        Object.assign(blurDiv.style, blurCSS);

        document.body.appendChild(blurDiv);


    }

    hasSequenceAt(position) {
        let returnSequences = [];
        this.sequences.forEach(sequence => {
            if (sequence.getOrigin().x === position.x && sequence.getOrigin().y === position.y) {
                returnSequences.push(sequence);
            }
        })
        return returnSequences;
    }

    hasBoxAt(position) {
        for (let i = 0; i < this.boxes.length; i++) {
            if (this.boxes[i].getPosition().x === position.x && this.boxes[i].getPosition().y === position.y) {
                return this.boxes[i];
            }
        }
        return null;
    }

    selectNextBox(currentBox) {

        let hasBelow = false;
        let belowBox = null;

        let hasRight = false;
        let rightBox = null;
        for (let i = 0; i < this.boxes.length; i++) {
            if (this.boxes[i].getPosition().x === currentBox.getPosition().x && this.boxes[i].getPosition().y === currentBox.getPosition().y + 1) {
                hasBelow = true;
                belowBox = this.boxes[i];
            }
            if (this.boxes[i].getPosition().x === currentBox.getPosition().x + 1 && this.boxes[i].getPosition().y === currentBox.getPosition().y) {
                hasRight = true;
                rightBox = this.boxes[i];
            }
        }

        let newVelocity;
        if (!this.typingVelocity) {
            if (hasRight && hasBelow) {
                newVelocity = Direction.across;
            } else if (hasRight) {
                newVelocity = Direction.across;
            } else if (hasBelow) {
                newVelocity = Direction.down;
            }
        } else {
            newVelocity = this.typingVelocity;
        }

        if (newVelocity === Direction.across) {
            if (!rightBox) {
                return;
            }
            rightBox.domElement.children[0].focus();
            this.typingVelocity = newVelocity;
        } else if (newVelocity === Direction.down) {
            if (!belowBox) {
                return;
            }
            belowBox.domElement.children[0].focus();
            this.typingVelocity = newVelocity;
        }

    }

    get dimensions() {

        let maxX = 0, minX = 0;
        let maxY = 0, minY = 0;

        this.boxes.forEach(box => {

            if (box.getPosition().x > maxX) {
                maxX = box.getPosition().x;
            } else if (box.getPosition().x < minX) {
                minX = box.getPosition().x;
                this.minXBox = box;
            }

            if (box.getPosition().y > maxY) {
                maxY = box.getPosition().y;
            } else if (box.getPosition().y < minY) {
                minY = box.getPosition().y;
                this.minYBox = box;
            }

        });

        this.maxX = maxX;
        this.minX = minX;
        this.maxY = maxY;
        this.minY = minY;

        return {
            width: maxX - minX + 1,
            height: maxY - minY + 1
        }

    }

    get xRange() {
        return [this.minX, this.maxX];
    }

    get yRange() {
        return [this.minY, this.maxY];
    }

    getPieceSize() {
        return this.pieceSize;
    }

    getBackdrop() {
        return this.backdrop;
    }

}

class CrosswordSequence {

    constructor(word, origin, direction, letterFill, preview, overlapBox = null) {

        this.word = word;

        this.origin = origin;

        this.direction = direction;

        this.letterFill = letterFill;
        this.preview = preview;

        this.length = word.length;

        this.boxes = [];

        this.sequenceNumber = 0;

        this.initSequence(overlapBox);

    }

    initSequence(overlapBox) {

        let numStatic = 0;
        for (let i = 0; i < this.length; i++) {

            let position = {};
            Object.assign(position, this.origin);
            if (this.direction === Direction.horizontal) {
                position.x += i;
            } else if (this.direction === Direction.vertical) {
                position.y += i;
            }

            if (overlapBox) {

                if (overlapBox.getPosition().x === position.x && overlapBox.getPosition().y === position.y) { // If it's the overlapped box
                    this.boxes.push(overlapBox);
                    if (!this.preview) {
                        overlapBox.staticBox = false;
                    }
                    continue;
                }
            }

            const box = new CrosswordBox(position, this.word[i]);

            if (this.preview) {
                box.staticBox = true;
            } else if (this.letterFill) {

                if (Math.random() < 0.4 && numStatic < this.length / 2) {
                    box.staticBox = true;
                    numStatic += 1
                }

            }

            this.boxes.push(box);

        }

    }

    show() {

        this.boxes.forEach((box, i) => {
            if (i === 0) {
                box.boxTitle = `${this.sequenceNumber}`;
            }

            box.init();
        });

    }

    setSequenceNumber(sequenceNumber) {
        this.sequenceNumber = sequenceNumber;
    }

    generateAdjacentSequence(overlapPos, word, wordOverlapIndex, letterFill, preview) {

        let newSequence;
        if (this.direction === Direction.horizontal) { // Create new vertical sequence
            const origin = {
                x: overlapPos.x,
                y: overlapPos.y - wordOverlapIndex
            }
            newSequence = new CrosswordSequence(word, origin, Direction.vertical, letterFill, preview, this.getBoxAt(overlapPos));
        } else if (this.direction === Direction.vertical) { // Create new horizontal sequence
            const origin = {
                x: overlapPos.x - wordOverlapIndex,
                y: overlapPos.y
            }
            newSequence = new CrosswordSequence(word, origin, Direction.horizontal, letterFill, preview, this.getBoxAt(overlapPos));
        }
        return newSequence;

    }

    hasOverlap(word) {

        let overlaps = [];

        this.getBoxes().forEach(box => {

            for (let letter of word) {

                if (box.getLetter() === letter) {

                    const overlap = {
                        letter: box.getLetter(),
                        position: {
                            x: box.getPosition().x,
                            y: box.getPosition().y
                        }
                    }
                    overlaps.push(overlap);
                    break;

                }

            }

        });

        return overlaps;

    }

    doesTouch(sequence) {

        return this.getBoxes().some(box => {

            return sequence.getBoxes().some(aBox => {

                if (box.distanceTo(aBox) <= 1) {
                    return true;
                }

            });

        });

    }

    getOrigin() {
        return this.origin;
    }

    getBoxes() {
        return this.boxes;
    }

    getSequenceNumber() {
        return this.sequenceNumber;
    }

    getWord() {
        return this.word;
    }

    getBoxAt(position) {
        let returnBox;
        this.boxes.forEach(box => {
            if (box.getPosition().x === position.x && box.getPosition().y === position.y) {
                returnBox = box;
            }
        })
        return returnBox;
    }

}



class CrosswordBox {

    constructor(position, letter) {

        this.position = position;

        this.correctLetter = letter;
        this.letter = letter;

        this.textColor = 'black';

        this.staticBox = false;

        this.sequences = null;

        this.board = null;

        this.boxTitle = null;

        this.domElement = null;

    }

    init() {

        const element = document.createElement("div");

        const sideLength = this.board.getPieceSize();
        const borderWidth = Math.ceil(this.board.getPieceSize() / 40);

        const elementCSS = {
            position: 'absolute',
            width: `${sideLength - 2 * borderWidth}px`,
            height: `${sideLength - 2 * borderWidth}px`,
            border: `${borderWidth}px solid black`,
            backgroundColor: 'white'
        }

        Object.assign(element.style, elementCSS);

        this.domElement = element;

        this.board.getBackdrop().appendChild(element);

        element.style.left = `${(this.position.x - this.board.xRange[0]) * sideLength}px`;
        element.style.top = `${(this.position.y - this.board.yRange[0]) * sideLength}px`;

        const letterDiv = document.createElement("div");

        const fontRatio2 = 26 / 37.5;
        const fontSize2 = fontRatio2 * this.board.getPieceSize();

        const letterCSS = {
            display: 'flex',
            width: `${sideLength - 2 * borderWidth}px`,
            height: `${sideLength - 2 * borderWidth}px`,
            fontFamily: 'arial',
            fontSize: `${fontSize2}px`,
            alignItems: 'center',
            justifyContent: 'center',
            color: 'transparent',
            textShadow: '0 0 0 black'
        }

        Object.assign(letterDiv.style, letterCSS);

        if (this.staticBox) {
            letterDiv.textContent = this.letter.toUpperCase();
        } else {
            letterDiv.contentEditable = true;
            this.letter = "";
        }

        function isLetter(c) {
            return c.toLowerCase() != c.toUpperCase();
        }

        letterDiv.onclick = () => {

            this.board.typingVelocity = null;

            var range = document.createRange();
            var sel = window.getSelection();
            range.setStart(letterDiv, 0);
            range.collapse(true);
            sel.removeAllRanges();
            sel.addRange(range);
            letterDiv.focus();

        }

        letterDiv.oninput = (e) => {

            var range = document.createRange();
            var sel = window.getSelection();
            range.setStart(letterDiv, 0);
            range.collapse(true);
            sel.removeAllRanges();
            sel.addRange(range);
            letterDiv.focus();

            let content = letterDiv.textContent;

            if (content.length > 1) {
                content = content.charAt(0);
            }

            if (!isLetter(content)) {
                letterDiv.textContent = "";
                this.letter = "";
                return;
            }

            content = content.toUpperCase();

            letterDiv.textContent = content;
            this.letter = content;

            if (this.board.checkForWin()) {
                alert("omg you're so good");
            }

            this.board.selectNextBox(this);

        }
        letterDiv.box = this;

        letterDiv.onkeydown = () => {

            if (event.keyCode === 37 || event.keyCode === 38 || event.keyCode === 39 || event.keyCode === 40) {
                return;
            }

            letterDiv.textContent = "";
            letterDiv.box.letter = "";

        }

        document.execCommand("fontName", false, "arial");

        element.appendChild(letterDiv);

        if (this.boxTitle) {

            const title = document.createElement("div");

            const fontRatio = 13 / 45.3;
            const fontSize = fontRatio * this.board.getPieceSize();

            const titleCSS = {
                position: 'absolute',
                display: 'flex',
                width: `${element.offsetWidth / 4}px`,
                height: `${element.offsetHeight / 4}px`,
                top: '0px',
                left: '0px',
                fontFamily: 'arial',
                fontSize: `${fontSize}px`,
                alignItems: 'center',
                justifyContent: 'center'
            }

            Object.assign(title.style, titleCSS);

            title.textContent = this.boxTitle;

            element.appendChild(title);

        }


    }

    setBoard(board) {
        this.board = board;
    }

    updateColor(color) {
        this.textColor = color;
        this.domElement.children[0].style.textShadow = `0 0 0 ${color}`;
    }

    distanceTo(aBox) {
        return Math.sqrt(Math.pow(this.getPosition().y - aBox.getPosition().y, 2) + Math.pow(this.getPosition().x - aBox.getPosition().x, 2));
    }

    getPosition() {
        return this.position;
    }

    getLetter() {
        return this.letter;
    }

    getCorrectLetter() {
        return this.correctLetter;
    }

}

class Alert {

    constructor(message) {

        this.message = message;

    }

    show() {

        const blurDiv = document.createElement("div");

        const blurCSS = {
            position: "absolute",
            width: "100%",
            height: "100%",
            backgroundColor: "white",
            opacity: "0.7",
            zIndex: "1"
        }
        Object.assign(blurDiv.style, blurCSS);

        const alert = document.createElement("div");

        const alertCSS = {
            position: "absolute",
            height: "100px",
            width: "600px",
            border: "1px solid black",
            borderRadius: "10px",
            backgroundColor: "white",
            zIndex: "2"
        }
        Object.assign(alert.style, alertCSS);

        const img = document.createElement("img");
        img.src = "https://cdn1.iconfinder.com/data/icons/smallicons-controls/32/614338-.svg-512.png";

        const imgCSS = {
            position: "absolute",
            width: "40px",
            height: "40px"
        }
        Object.assign(img.style, imgCSS);

        const text = document.createElement("p");
        text.className = "alertText";
        text.textContent = this.message;

        const textCSS = {
            position: "absolute",
            width: "600px",
            textAlign: "center",
            fontFamily: "arial",
            fontSize: "16px",
            margin: "0"
        }
        Object.assign(text.style, textCSS);

        alert.appendChild(text);
        alert.appendChild(img);
        document.body.appendChild(alert);
        document.body.appendChild(blurDiv);

        img.style.left = `${alert.offsetWidth / 2 - img.offsetWidth / 2}px`;
        img.style.top = `10px`;

        text.style.left = `0px`;
        text.style.top = `65px`;

        alert.style.left = `${window.innerWidth / 2 - alert.offsetWidth / 2}px`;
        alert.style.top = `${window.innerHeight / 2 - alert.offsetHeight / 2}px`;

        throw Error;

    }


}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]; // eslint-disable-line no-param-reassign
    }
}

