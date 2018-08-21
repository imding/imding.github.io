const
	resolution = [4, 3],
    sizeRatio = 0.8;
    
let
	image,
    puzzle = [],
    puzzleGrid = [],
    activeIndex,
    activeGrid,    
    mouseDown = false;

// ===== FUNCTIONS =====

function loadImage() {
	image = document.createElement('img');

	if (imageLink.value) {
		image.src = imageLink.value;
		imageLink.value = '';
	} else {
		image.src = 'http://4.bp.blogspot.com/-ZuA-7FNmz2g/T-SIWIsf6TI/AAAAAAAAARI/5W0V4h938GE/s1600/Cheetah3.jpg';
	}

	image.onload = function() { initialze() };
}

function initialze() {
	generatePuzzle();
    shuffle(puzzle);

    spare.style.height = window.innerHeight - spare.offsetTop + 'px';
    newPuzzle.innerHTML = 'New Puzzle';

    puzzle.forEach((piece, i) => {
        puzzleContainer.appendChild(piece);
        piece.location = puzzleGrid[i];

        if (Math.random() > 0.5) {
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
        puzzleGrid.push({x: `${x}px`, y: `${y}px`, isEmpty: true, index: i});
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

            let s = puzzleGrid[activeIndex].isEmpty;
            puzzleGrid[activeIndex].isEmpty = true;

            console.log('Picked up from', puzzleGrid[activeIndex]);
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
				placePiece({x: `${puzzle[activeIndex].offsetLeft}px`, y: `${puzzle[activeIndex].offsetTop}px`});
				console.log('Dropped in spare box.');
			} else {
				placePiece(puzzle[activeIndex].location)
			}
		}
		activeIndex = null;
	}
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
		puzzleContainer.style.borderColor = 'green';
		newPuzzle.innerHTML = 'You solved the puzzle. Play again.';		
	}
}

function resetPuzzle() {
	puzzle.forEach(piece => puzzleContainer.removeChild(piece));

	image = null;
    puzzle = [];
    puzzleGrid = [];
    activeIndex = null;
    activeGrid = null;
    mouseDown = false;
    newPuzzle.innerHTML = 'Loading image...';
    puzzleContainer.style.borderColor = 'black';

    loadImage();
}

function range(min, max, int = false) {
    const r = Math.random() * (max - min) + min;
    return int ? Math.round(r) : r;
}

// ===== EVENTS =====

window.onload = function() { 
	loadImage();
	newPuzzle.onclick = function() { resetPuzzle() };
};

window.ontouchstart = (evt) => selectPiece(evt.target);
window.onmousedown = (evt) => {
    mouseDown = true;
    selectPiece(evt.target);
};
    
window.ontouchmove = (evt) => movePiece(evt.touches[0].clientX, evt.touches[0].clientY);
window.onmousemove = (evt) => {
    if (mouseDown) movePiece(evt.clientX, evt.clientY);
};

window.ontouchend = (evt) => dropPiece(evt.changedTouches[0].clientX, evt.changedTouches[0].clientY);
window.onmouseup = function(evt) {
    mouseDown = false;
    dropPiece(evt.clientX, evt.clientY);
};