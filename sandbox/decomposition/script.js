const Orientation = Object.freeze({ horizontal: 1, vertical: 2, diagonalLeft: 3, diagonalRight: 4, diagonalLeftDown: 5, top: 6, left: 7, right: 8, rightFlatDown: 9, bottomLeft: 10, topLeft: 11, topRight: 12 });
const StackType = Object.freeze({ horizontal: 1, custom: 2 });

let hexagon;
let rhombus;
let trapezoid, trapezoid2;
let triangle, triangle2, triangle3, triangle4;

let pieces = [];

let mousedown = false;

let activePiece = null;

let secondaryLocation = null;

let progressStatus = [false, false, false];

class Piece {

    constructor(origin, dimensions) {

        this.piece = document.createElement('div');

        this.piece.style.position = 'absolute';

        this.piece.style.left = origin.x + 'px';
        this.piece.style.top = origin.y + 'px';

        this.piece.style.width = dimensions.width + 'px';
        this.piece.style.height = dimensions.height + 'px';

    }

    update(origin, dimensions) {

        this.piece.style.left = origin.x + 'px';
        this.piece.style.top = origin.y + 'px';

        this.piece.style.width = dimensions.width + 'px';
        this.piece.style.height = dimensions.height + 'px';

    }

    updateColor(color) {
        this.piece.style.backgroundColor = color;
    }

    updateBorders(borders) {

        if ('top' in borders) {
            this.piece.style.borderTop = borders.top;
        }

        if ('bottom' in borders) {
            this.piece.style.borderBottom = borders.bottom;
        }

        if ('left' in borders) {
            this.piece.style.borderLeft = borders.left;
        }

        if ('right' in borders) {
            this.piece.style.borderRight = borders.right;
        }

    }

    addToParent(parent) {
        parent.appendChild(this.piece);
    }

    removeFromParent(parent) {
        parent.removeChild(this.piece);
    }

    setOrigin(origin) {

        this.piece.style.left = origin.x + 'px';
        this.piece.style.top = origin.y + 'px';

    }

    get origin() {

        return {
            x: this.piece.offsetLeft,
            y: this.piece.offsetTop
        };

    }


    get dimensions() {

        return {
            width: this.piece.offsetWidth,
            height: this.piece.offsetHeight
        };

    }

}

class PieceSet {

    constructor(pieces, origin, stackType) {

        this.set = document.createElement('div');
        this.set.style.position = 'absolute';

        this.addToParent(document.body);

        this.shapeColor = 'blue';
        this.overlayPieces = [];

        this.orientation;

        // If the pieces are to be appended right next to each other, horizontally
        if (stackType === StackType.horizontal) {

            let originX = 0;

            let totalWidth = 0;
            let maxHeight = 0;

            pieces.forEach(piece => {

                piece.addToParent(this.set);

                const pieceDimensions = piece.dimensions;

                piece.setOrigin({ x: originX, y: 0 });

                originX += pieceDimensions.width;

                totalWidth += pieceDimensions.width;

                if (pieceDimensions.height > maxHeight) {
                    maxHeight = pieceDimensions.height;
                }

            });

            this.set.style.width = totalWidth + 'px';
            this.set.style.height = maxHeight + 'px';

            this.set.style.left = origin.x + 'px';
            this.set.style.top = origin.y + 'px';

        }
        else if (stackType === StackType.custom) { // If each piece needs to be at a specific point

            let lowestPoint = 0; // The maximum y-value of any piece
            let furthestPoint = 0; // The maximum x-value of any piece

            pieces.forEach(piece => {

                piece.addToParent(this.set);

                const pieceDimensions = piece.dimensions;
                const pieceOrigin = piece.origin;

                if (pieceOrigin.y + pieceDimensions.height > lowestPoint) {
                    lowestPoint = pieceOrigin.y + pieceDimensions.height;
                }

                if (pieceOrigin.x + pieceDimensions.width > furthestPoint) {
                    furthestPoint = pieceOrigin.x + pieceDimensions.width;
                }

            });

            this.set.style.width = furthestPoint + 'px';
            this.set.style.height = lowestPoint + 'px';

            this.set.style.left = origin.x + 'px';
            this.set.style.top = origin.y + 'px';

        }

        // Set configurations

        this.configurations = [];

    }

    get origin() {

        return {
            x: this.set.offsetLeft,
            y: this.set.offsetTop
        };

    }

    get dimensions() {

        return {
            width: this.set.offsetWidth,
            height: this.set.offsetHeight
        };

    }

    get pieceSet() {
        return this.set;
    }

    get pieceConfigurations() {
        return this.configurations;
    }

    get pieceOrientation() {
        return this.orientation;
    }

    updateOrigin(origin) {
        this.set.style.left = origin.x + 'px';
        this.set.style.top = origin.y + 'px';
    }

    updateShapeColor(color) {
        this.shapeColor = color;
    }

    updateZIndex(z) {
        this.set.childNodes.forEach(childNode => {
            childNode.style.zIndex = z;
        });
    }

    updateTransitionDuration(t) {
        this.set.childNodes.forEach(childNode => {
            childNode.style.transitionDuration = t + 's';
        });
    }


    isValidPieceSet(pieceSet) {

        return this.configurations.some(configuration => {
            return configuration.isPossiblePieceSet(pieceSet);
        });

    }

    addToParent(parent) {
        parent.appendChild(this.set);
    }

}

class Configuration {

    constructor(shapeClassName, shapeOrientation, reqOrigin, reqDimensions) {

        this.shapeClassName = shapeClassName;

        this.shapeOrientation = shapeOrientation;

        this.reqOrigin = reqOrigin;
        this.reqDimensions = reqDimensions;

    }

    // For determining if a shape will fit in the configuration
    isPossiblePieceSet(pieceSet) {

        // If it is the correct shape
        if (pieceSet.constructor.name === this.shapeClassName) {

            // If the shape is in the correct orientation
            if (pieceSet.pieceOrientation === this.shapeOrientation) {

                const pieceOrigin = pieceSet.origin;
                const pieceDimensions = pieceSet.dimensions;

                if (pieceOrigin.x >= this.reqOrigin.x - 20 && pieceOrigin.x <= this.reqOrigin.x + 20 && pieceOrigin.y >= this.reqOrigin.y - 20 && pieceOrigin.y <= this.reqOrigin.y + 20) {

                    // If the dimensions of the shape match the required dimensions
                    if (pieceDimensions.width === this.reqDimensions.width && pieceDimensions.height === this.reqDimensions.height) {

                        return true;

                    }

                }

            }

        }
        return false;

    }

    get origin() {
        return this.reqOrigin;
    }

}


class Square extends PieceSet {

    constructor(origin, dimensions, orientation, color) {
        const height = dimensions.height;
        const width = dimensions.width;

        if (orientation === Orientation.vertical) {

            const piece = new Piece({ x: 0, y: 0 }, { width: width, height: height });
            piece.updateColor(color);

            super([piece], origin, StackType.custom);

        }
        else {
            super();
        }

        this.orientation = orientation;

        // Insert configurations

        // Configurations for trapezoid 2
        this.configurations.push(new Configuration('Trapezoid', Orientation.rightFlatDown, { x: this.set.offsetLeft, y: this.set.offsetTop }, { width: this.set.offsetWidth, height: this.set.offsetHeight / 2 }));
        this.configurations.push(new Configuration('Trapezoid', Orientation.rightFlatDown, { x: this.set.offsetLeft, y: this.set.offsetTop + this.set.offsetHeight / 2 }, { width: this.set.offsetWidth, height: this.set.offsetHeight / 2 }));

        // Configurations for triangle 2
        this.configurations.push(new Configuration('Triangle', Orientation.right, { x: this.set.offsetLeft, y: this.set.offsetTop }, { width: this.set.offsetWidth / 2, height: this.set.offsetHeight }));
        this.configurations.push(new Configuration('Triangle', Orientation.right, { x: this.set.offsetLeft + this.set.offsetWidth / 2, y: this.set.offsetTop }, { width: this.set.offsetWidth / 2, height: this.set.offsetHeight }));

        // Configurations for triangle 3
        this.configurations.push(new Configuration('Triangle', Orientation.top, { x: this.set.offsetLeft, y: this.set.offsetTop }, { width: this.set.offsetWidth, height: this.set.offsetHeight / 2 }));
        this.configurations.push(new Configuration('Triangle', Orientation.top, { x: this.set.offsetLeft, y: this.set.offsetTop + this.set.offsetHeight / 2 }, { width: this.set.offsetWidth, height: this.set.offsetHeight / 2 }));

        // Configurations for triangle 4
        this.configurations.push(new Configuration('Triangle', Orientation.topRight, { x: this.set.offsetLeft, y: this.set.offsetTop }, { width: this.set.offsetWidth / 2, height: this.set.offsetHeight / 2 }));
        this.configurations.push(new Configuration('Triangle', Orientation.topRight, { x: this.set.offsetLeft + this.set.offsetWidth / 2, y: this.set.offsetTop }, { width: this.set.offsetWidth / 2, height: this.set.offsetHeight / 2 }));
        this.configurations.push(new Configuration('Triangle', Orientation.topRight, { x: this.set.offsetLeft, y: this.set.offsetTop + this.set.offsetHeight / 2 }, { width: this.set.offsetWidth / 2, height: this.set.offsetHeight / 2 }));
        this.configurations.push(new Configuration('Triangle', Orientation.topRight, { x: this.set.offsetLeft + this.set.offsetWidth / 2, y: this.set.offsetTop + this.set.offsetHeight / 2 }, { width: this.set.offsetWidth / 2, height: this.set.offsetHeight / 2 }));


    }

}


class Triangle extends PieceSet {

    constructor(origin, dimensions, orientation, color) {

        const height = dimensions.height;
        const width = dimensions.width;

        if (orientation === Orientation.left) {

            const piece = new Piece({ x: 0, y: 0 }, { width: 0, height: 0 });

            piece.updateBorders({
                top: height / 2 + 'px solid transparent',
                right: width + 'px solid ' + color,
                bottom: height / 2 + 'px solid transparent'
            });

            super([piece], origin, StackType.custom);

        }
        else if (orientation === Orientation.right) {

            const piece = new Piece({ x: 0, y: 0 }, { width: 0, height: 0 });

            piece.updateBorders({
                top: height / 2 + 'px solid transparent',
                left: width + 'px solid ' + color,
                bottom: height / 2 + 'px solid transparent'
            });

            super([piece], origin, StackType.custom);

        }
        else if (orientation === Orientation.top) {

            const piece = new Piece({ x: 0, y: 0 }, { width: 0, height: 0 });

            piece.updateBorders({
                left: width / 2 + 'px solid transparent',
                right: width / 2 + 'px solid transparent',
                bottom: height + 'px solid ' + color
            });

            super([piece], origin, StackType.custom);


        }
        else if (orientation === Orientation.bottomLeft) {

            const piece = new Piece({ x: 0, y: 0 }, { width: 0, height: 0 });

            piece.updateBorders({
                bottom: height + 'px solid ' + color,
                right: width + 'px solid transparent'
            });

            super([piece], origin, StackType.custom);

        }
        else if (orientation === Orientation.topLeft) {

            const piece = new Piece({ x: 0, y: 0 }, { width: 0, height: 0 });

            piece.updateBorders({
                top: height + 'px solid ' + color,
                right: width + 'px solid transparent'
            });

            super([piece], origin, StackType.custom);

        }
        else if (orientation === Orientation.topRight) {

            const piece = new Piece({ x: 0, y: 0 }, { width: 0, height: 0 });

            piece.updateBorders({
                top: height + 'px solid ' + color,
                left: width + 'px solid transparent'
            });

            super([piece], origin, StackType.custom);

        }
        else {
            super();
        }

        this.orientation = orientation;

    }

}

class Trapezoid extends PieceSet {

    constructor(origin, dimensions, orientation, color) {

        const height = dimensions.height;
        const width = dimensions.width;

        if (orientation === Orientation.diagonalLeftDown) {

            const topPiece = new Piece({ x: 0, y: 0 }, { width: 0, height: 0 });

            topPiece.updateBorders({
                top: height / 3 + 'px solid transparent',
                left: width / 2 + 'px solid ' + color,
                bottom: height / 3 + 'px solid transparent'
            });

            const bottomLeftPiece = new Piece({ x: 0, y: height / 3 }, { width: 0, height: 0 });

            bottomLeftPiece.updateBorders({
                top: height / 3 + 'px solid transparent',
                right: width / 2 + 'px solid ' + color,
                bottom: height / 3 + 'px solid transparent'
            });

            const bottomRightPiece = new Piece({ x: width / 2, y: height / 3 }, { width: 0, height: 0 });

            bottomRightPiece.updateBorders({
                top: height / 3 + 'px solid transparent',
                left: width / 2 + 'px solid ' + color,
                bottom: height / 3 + 'px solid transparent'
            });

            super([topPiece, bottomLeftPiece, bottomRightPiece], origin, StackType.custom);

        }
        else if (orientation === Orientation.rightFlatDown) {

            const leftPiece = new Piece({ x: 0, y: 0 }, { width: 0, height: 0 });

            leftPiece.updateBorders({
                top: height + 'px solid ' + color,
                left: width / 2 + 'px solid transparent'
            });

            const rightPiece = new Piece({ x: 0, y: 0 }, { width: width / 2, height: height });
            rightPiece.updateColor(color);

            super([leftPiece, rightPiece], origin, StackType.horizontal);

        }
        else {
            super();
        }

        this.orientation = orientation;

    }

}

class Rhombus extends PieceSet {

    constructor(origin, dimensions, orientation, color) {

        const height = dimensions.height;
        const width = dimensions.width;

        if (orientation === Orientation.horizontal) {

            // The height of the rhombus will equal the top + bottom border width
            // The width of the rhombus will equal 1/2 of each half's left/right width

            const leftPiece = new Piece({ x: 0, y: 0 }, { width: 0, height: 0 });

            leftPiece.updateBorders({
                top: height / 2 + 'px solid transparent',
                right: width / 2 + 'px solid ' + color,
                bottom: height / 2 + 'px solid transparent'
            });

            const rightPiece = new Piece({ x: 0, y: 0 }, { width: 0, height: 0 });

            rightPiece.updateBorders({
                top: height / 2 + 'px solid transparent',
                left: width / 2 + 'px solid ' + color,
                bottom: height / 2 + 'px solid transparent'
            });

            super([leftPiece, rightPiece], origin, StackType.horizontal);

        }
        else if (orientation === Orientation.diagonalLeft) {

            // The height of the rhombus will equal twice of each pieces' top + bottom border width
            // The width of the rhombus will equal left/right width

            const topPiece = new Piece({ x: 0, y: 0 }, { width: 0, height: 0 });

            topPiece.updateBorders({
                top: height / 3 + 'px solid transparent',
                left: width + 'px solid ' + color,
                bottom: height / 3 + 'px solid transparent'
            });

            // The y-value of the bottom piece is 1/4 down the height of the rhombus
            const bottomPiece = new Piece({ x: 0, y: height / 3 }, { width: 0, height: 0 });

            bottomPiece.updateBorders({
                top: height / 3 + 'px solid transparent',
                right: width + 'px solid ' + color,
                bottom: height / 3 + 'px solid transparent'
            });

            super([topPiece, bottomPiece], origin, StackType.custom);

        }
        else if (orientation === Orientation.diagonalRight) {

            // The height of the rhombus will equal twice of each pieces' top + bottom border width
            // The width of the rhombus will equal left/right width

            const topPiece = new Piece({ x: 0, y: 0 }, { width: 0, height: 0 });

            topPiece.updateBorders({
                top: height / 3 + 'px solid transparent',
                right: width + 'px solid ' + color,
                bottom: height / 3 + 'px solid transparent'
            });

            // The y-value of the bottom piece is 1/4 down the height of the rhombus
            const bottomPiece = new Piece({ x: 0, y: height / 3 }, { width: 0, height: 0 });

            bottomPiece.updateBorders({
                top: height / 3 + 'px solid transparent',
                left: width + 'px solid ' + color,
                bottom: height / 3 + 'px solid transparent'
            });

            super([topPiece, bottomPiece], origin, StackType.custom);

        }
        else {
            super();
        }

        this.orientation = orientation;

    }

}

class Hexagon extends PieceSet {

    constructor(origin, dimensions, orientation, color) {

        const height = dimensions.height;
        const width = dimensions.width;

        if (orientation === Orientation.vertical) {

            const topPiece = new Piece({ x: 0, y: 0 }, { width: 0, height: 0 });

            topPiece.updateBorders({
                left: width / 2 + 'px solid transparent',
                right: width / 2 + 'px solid transparent',
                bottom: height / 4 + 'px solid ' + color
            });

            const middlePiece = new Piece({ x: 0, y: height / 4 }, { width: width, height: height / 2 });
            middlePiece.updateColor(color);

            const bottomPiece = new Piece({ x: 0, y: 3 * height / 4 }, { width: 0, height: 0 });

            bottomPiece.updateBorders({
                left: width / 2 + 'px solid transparent',
                right: width / 2 + 'px solid transparent',
                top: height / 4 + 'px solid ' + color
            });

            super([topPiece, middlePiece, bottomPiece], origin, StackType.custom);

            this.orientation = orientation;

            // Add configurations

            /***
            For three rhombi in hexagon
            ***/

            // Arrangement #1
            this.configurations.push(new Configuration('Rhombus', Orientation.diagonalLeft, { x: this.set.offsetLeft, y: this.set.offsetTop + this.set.offsetHeight / 4 }, { width: this.set.offsetWidth / 2, height: 3 * this.set.offsetHeight / 4 }));
            this.configurations.push(new Configuration('Rhombus', Orientation.diagonalRight, { x: this.set.offsetLeft + this.set.offsetWidth / 2, y: this.set.offsetTop + this.set.offsetHeight / 4 }, { width: this.set.offsetWidth / 2, height: 3 * this.set.offsetHeight / 4 }));
            this.configurations.push(new Configuration('Rhombus', Orientation.horizontal, { x: this.set.offsetLeft, y: this.set.offsetTop }, { width: this.set.offsetWidth, height: this.set.offsetHeight / 2 }));

            //Arrangement #2
            this.configurations.push(new Configuration('Rhombus', Orientation.diagonalLeft, { x: this.set.offsetLeft + this.set.offsetWidth / 2, y: this.set.offsetTop }, { width: this.set.offsetWidth / 2, height: 3 * this.set.offsetHeight / 4 }));
            this.configurations.push(new Configuration('Rhombus', Orientation.diagonalRight, { x: this.set.offsetLeft, y: this.set.offsetTop }, { width: this.set.offsetWidth / 2, height: 3 * this.set.offsetHeight / 4 }));
            this.configurations.push(new Configuration('Rhombus', Orientation.horizontal, { x: this.set.offsetLeft, y: this.set.offsetTop + this.set.offsetHeight / 2 }, { width: this.set.offsetWidth, height: this.set.offsetHeight / 2 }));

            /***
            For the trapezoid, small triangle, and rhombus in hexagon
            ***/

            this.configurations.push(new Configuration('Trapezoid', Orientation.diagonalLeftDown, { x: this.set.offsetLeft, y: this.set.offsetTop + this.set.offsetHeight / 4 }, { width: this.set.offsetWidth, height: 3 * this.set.offsetHeight / 4 }));
            this.configurations.push(new Configuration('Triangle', Orientation.left, { x: this.set.offsetLeft, y: this.set.offsetTop }, { width: this.set.offsetWidth / 2, height: this.set.offsetHeight / 2 }));

        }
        else {
            super();
        }

    }

}

window.onload = () => {


    /*** Puzzle #1 ***/

    // Create hexagon (the puzzle)
    hexagon = new Hexagon({ x: puzzleContainer.offsetLeft + puzzleContainer.offsetWidth / 3 - 52, y: puzzleContainer.offsetTop + puzzleContainer.offsetHeight / 2 - 60 }, { width: 104, height: 120 }, Orientation.vertical, 'black');
    hexagon.addToParent(puzzleContainer);

    // Create the rhombi puzzle pieces
    /*rhombus1 = new Rhombus({x: pieceContainer.offsetLeft + 3*pieceContainer.offsetWidth/4 - 52, y: pieceContainer.offsetTop + pieceContainer.offsetHeight/2 - 30}, {width: 104, height: 60}, Orientation.horizontal, "red");
    rhombus1.addToParent(document.body);
    */

    rhombus = new Rhombus({ x: pieceContainer.offsetLeft + 3 * pieceContainer.offsetWidth / 5 - 26, y: pieceContainer.offsetTop + 2 * pieceContainer.offsetHeight / 3 - 45 }, { width: 52, height: 90 }, Orientation.diagonalLeft, '#E88D67');
    rhombus.addToParent(document.body);

    /*rhombus3 = new Rhombus({x: pieceContainer.offsetLeft + pieceContainer.offsetWidth/4 - 26, y: pieceContainer.offsetTop + pieceContainer.offsetHeight/2 - 45}, {width: 52, height: 90}, Orientation.diagonalRight, "red");
    rhombus3.addToParent(document.body);*/


    trapezoid = new Trapezoid({ x: pieceContainer.offsetLeft + pieceContainer.offsetWidth / 5 - 52, y: pieceContainer.offsetTop + pieceContainer.offsetHeight / 3 - 45 }, { width: 104, height: 90 }, Orientation.diagonalLeftDown, '#E88D67');
    trapezoid.addToParent(document.body);

    triangle = new Triangle({ x: pieceContainer.offsetLeft + 4 * pieceContainer.offsetWidth / 5 - 26, y: pieceContainer.offsetTop + pieceContainer.offsetHeight / 3 - 30 }, { width: 52, height: 60 }, Orientation.left, '#E88D67');
    triangle.addToParent(document.body);

    /*** Puzzle #2 ***/

    square = new Square({ x: puzzleContainer.offsetLeft + 2 * puzzleContainer.offsetWidth / 3 - 50, y: puzzleContainer.offsetTop + puzzleContainer.offsetHeight / 2 - 50 }, { width: 100, height: 100 }, Orientation.vertical, 'black');
    square.addToParent(document.body);

    trapezoid2 = new Trapezoid({ x: pieceContainer.offsetLeft + 2 * pieceContainer.offsetWidth / 5 - 50, y: pieceContainer.offsetTop + pieceContainer.offsetHeight / 3 - 25 }, { width: 100, height: 50 }, Orientation.rightFlatDown, '#E88D67');
    trapezoid2.addToParent(document.body);

    triangle2 = new Triangle({ x: pieceContainer.offsetLeft + 2 * pieceContainer.offsetWidth / 5 - 25, y: pieceContainer.offsetTop + 2 * pieceContainer.offsetHeight / 3 - 50 }, { width: 50, height: 100 }, Orientation.right, '#E88D67');
    triangle2.addToParent(document.body);

    triangle3 = new Triangle({ x: pieceContainer.offsetLeft + pieceContainer.offsetWidth / 5 - 50, y: pieceContainer.offsetTop + 2 * pieceContainer.offsetHeight / 3 - 25 }, { width: 100, height: 50 }, Orientation.top, '#E88D67');
    triangle3.addToParent(document.body);

    triangle4 = new Triangle({ x: pieceContainer.offsetLeft + 3 * pieceContainer.offsetWidth / 5 - 25, y: pieceContainer.offsetTop + pieceContainer.offsetHeight / 3 - 25 }, { width: 50, height: 50 }, Orientation.topRight, '#E88D67');
    triangle4.addToParent(document.body);


    pieces = [rhombus, trapezoid, triangle, trapezoid2, triangle2, triangle3, triangle4];


};

window.onresize = () => {

    // Reposition puzzles
    hexagon.updateOrigin({
        x: puzzleContainer.offsetLeft + puzzleContainer.offsetWidth / 3 - 52,
        y: puzzleContainer.offsetTop + puzzleContainer.offsetHeight / 2 - 60
    });

    square.updateOrigin({
        x: puzzleContainer.offsetLeft + 2 * puzzleContainer.offsetWidth / 3 - 50,
        y: puzzleContainer.offsetTop + puzzleContainer.offsetHeight / 2 - 50
    });

    // Reposition puzzle pieces
    trapezoid.updateOrigin({
        x: pieceContainer.offsetLeft + pieceContainer.offsetWidth / 5 - 52,
        y: pieceContainer.offsetTop + pieceContainer.offsetHeight / 3 - 45
    });

    rhombus.updateOrigin({
        x: pieceContainer.offsetLeft + 3 * pieceContainer.offsetWidth / 5 - 26,
        y: pieceContainer.offsetTop + 2 * pieceContainer.offsetHeight / 3 - 45
    });

    triangle.updateOrigin({
        x: pieceContainer.offsetLeft + 4 * pieceContainer.offsetWidth / 5 - 26,
        y: pieceContainer.offsetTop + pieceContainer.offsetHeight / 3 - 30
    });

    trapezoid2.updateOrigin({
        x: pieceContainer.offsetLeft + 2 * pieceContainer.offsetWidth / 5 - 50,
        y: pieceContainer.offsetTop + pieceContainer.offsetHeight / 3 - 25
    });

    triangle2.updateOrigin({
        x: pieceContainer.offsetLeft + 2 * pieceContainer.offsetWidth / 5 - 25,
        y: pieceContainer.offsetTop + 2 * pieceContainer.offsetHeight / 3 - 50
    });

    triangle3.updateOrigin({
        x: pieceContainer.offsetLeft + pieceContainer.offsetWidth / 5 - 50,
        y: pieceContainer.offsetTop + 2 * pieceContainer.offsetHeight / 3 - 25
    });

    triangle4.updateOrigin({
        x: pieceContainer.offsetLeft + 3 * pieceContainer.offsetWidth / 5 - 25,
        y: pieceContainer.offsetTop + pieceContainer.offsetHeight / 3 - 25
    });

};

window.onmousedown = () => {
    mousedown = true;
    selectPiece(event.target);
};

window.onmousemove = () => {
    if (mousedown) {
        movePiece(event.clientX, event.clientY);
    }
};

window.onmouseup = () => {
    mousedown = false;
    dropPiece(event.clientX, event.clientY);
};

function selectPiece(target) {

    if (activePiece === null) {

        const pieceSet = target.parentElement;

        pieces.some(piece => {

            if (piece.pieceSet === pieceSet) {
                activePiece = piece;
                return true;
            }
            return false;
        });

        if (activePiece !== null) {

            secondaryLocation = {
                x: activePiece.origin.x,
                y: activePiece.origin.y
            };

            pieces.forEach(piece => {
                piece.updateZIndex(0);
            });
            activePiece.updateZIndex(1);

        }

    }

}

function movePiece(clientX, clientY) {

    if (activePiece !== null) {

        activePiece.updateTransitionDuration(0);

        activePiece.updateOrigin({
            x: clientX - activePiece.dimensions.width / 2,
            y: clientY - activePiece.dimensions.height / 2
        });

    }

}

function dropPiece(clientX, clientY) {

    // If no valid piece is selected
    if (activePiece === null) {
        return;
    }

    let target;
    let isValidHexagonDrop = hexagon.pieceConfigurations.some(configuration => {
        if (configuration.isPossiblePieceSet(activePiece)) {
            target = configuration.origin;
            return true;
        }
    });
    let isValidSquareDrop = square.pieceConfigurations.some(configuration => {
        if (configuration.isPossiblePieceSet(activePiece)) {
            target = configuration.origin;
            return true;
        }
    });
    if (isValidHexagonDrop || isValidSquareDrop) {
        placePiece(target);
        return;
    } else {

        // If the piece was dropped in the tray
        if (clientX >= pieceContainer.offsetLeft && clientX <= pieceContainer.offsetLeft + pieceContainer.offsetWidth && clientY >= pieceContainer.offsetTop && clientY <= pieceContainer.offsetTop + pieceContainer.offsetHeight) {

            placePiece({
                x: clientX - activePiece.dimensions.width / 2,
                y: clientY - activePiece.dimensions.height / 2
            });
            return;

        } else {

            placePiece(secondaryLocation);
            return;

        }

    }

}


function placePiece(target) {

    activePiece.updateTransitionDuration(0.2);

    activePiece.updateOrigin(target);

    activePiece = null;
    secondaryLocation = null;

    setTimeout(checkStatus, 500);

}

function checkStatus() {

    // If the hexagon is completed
    if (rhombus.origin.x === hexagon.origin.x + hexagon.dimensions.width / 2 && rhombus.origin.y === hexagon.origin.y && trapezoid.origin.x === hexagon.origin.x && trapezoid.origin.y === hexagon.origin.y + hexagon.dimensions.height / 4 && triangle.origin.x === hexagon.origin.x && triangle.origin.y === hexagon.origin.y) {
        progressStatus[0] = true;
    }

    // If the square is completed
    if (trapezoid2.origin.x === square.origin.x && trapezoid2.origin.y === square.origin.y && triangle2.origin.x === square.origin.x && triangle2.origin.y === square.origin.y && triangle3.origin.x === square.origin.x && triangle3.origin.y === square.origin.y + square.dimensions.height / 2 && triangle4.origin.x === square.origin.x + square.dimensions.width / 2 && triangle4.origin.y === square.origin.y + square.dimensions.height / 2) {
        progressStatus[1] = true;
    }

    // If both the hexagon and the square are completed
    if (rhombus.origin.x === hexagon.origin.x + hexagon.dimensions.width / 2 && rhombus.origin.y === hexagon.origin.y && trapezoid.origin.x === hexagon.origin.x && trapezoid.origin.y === hexagon.origin.y + hexagon.dimensions.height / 4 && triangle.origin.x === hexagon.origin.x && triangle.origin.y === hexagon.origin.y && trapezoid2.origin.x === square.origin.x && trapezoid2.origin.y === square.origin.y && triangle2.origin.x === square.origin.x && triangle2.origin.y === square.origin.y && triangle3.origin.x === square.origin.x && triangle3.origin.y === square.origin.y + square.dimensions.height / 2 && triangle4.origin.x === square.origin.x + square.dimensions.width / 2 && triangle4.origin.y === square.origin.y + square.dimensions.height / 2) {
        progressStatus[2] = true;
        window.confirm('Yay! You completed the puzzles!');
    }

}