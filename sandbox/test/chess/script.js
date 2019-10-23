//  JavaScript
var cfg = { position: 'start' };

cfg.draggable = true;
cfg.onMouseoverSquare = handleMouseoverSquare;
cfg.onMouseoutSquare = handleMouseoutSquare;
cfg.onDragStart = handleDragStart;
cfg.onDrop = handleDrop;
cfg.onSnapEnd = handleSnapEnd;

var board = ChessBoard('board', cfg);
var game = new Chess();

function calculateBestMove() {
    var moves = game.ugly_moves();
    var bestMove = null;
    var bestValue = -9999;

    moves.forEach(move => {
        game.ugly_move(move);

        var value = -evaluateBoard(game.board());

        game.undo();

        if (value > bestValue) {
            bestValue = value;
            bestMove = move;
        }
    });

    return bestMove;
}

function evaluateBoard(board) {
    var totalEvaluation = 0;

    for (var i = 0; i < 8; i++) {
        for (var j = 0; j < 8; j++) {
            totalEvaluation = totalEvaluation + getPieceValue(board[i][j]);
        }
    }

    return totalEvaluation;
}

function getPieceValue(piece) {
    if (piece === null) return 0;

    var getAbsoluteValue = piece => {
        if (piece.type === 'p') {
            return 10;
        } else if (piece.type === 'r') {
            return 50;
        } else if (piece.type === 'n') {
            return 30;
        } else if (piece.type === 'b') {
            return 30;
        } else if (piece.type === 'q') {
            return 90;
        } else if (piece.type === 'k') {
            return 900;
        }
        throw "Unknown piece type: " + piece.type;
    };
    var absoluteValue = getAbsoluteValue(piece, piece.color === 'w');

    return piece.color === 'w' ? absoluteValue : -absoluteValue;
}

function handleDragStart(source, piece) {
    if (game.in_checkmate() === true || game.in_draw() === true || piece.search(/^b/) !== -1) {
        return false;
    }
}

function handleDrop(source, target) {
    var move = game.move({ from: source, to: target });

    removeGreySquares();

    if (move === null) { return 'snapback' }

    setTimeout(makeBestMove, 250);
}

function makeBestMove() {
    var bestMove = getBestMove(game);

    game.ugly_move(bestMove);
    board.position(game.fen());

    if (game.game_over()) {
        alert('Game over');
    }
}

function getBestMove(game) {
    if (game.game_over()) {
        alert('Game over');
    }

    var bestMove = calculateBestMove(game);

    return bestMove;
}

function handleMouseoverSquare(square) {
    var moves = game.moves({ square, verbose: true });

    if (moves.length > 0) {
        moves.forEach(move => greySquare(move.to));
        greySquare(square);
    }
}

function handleMouseoutSquare() {
    removeGreySquares();
}

function handleSnapEnd() {
    board.position(game.fen());
}

function removeGreySquares() {
    $('#board .square-55d63').css('background', '');
}

function greySquare(square) {
    var squareEl = $('#board .square-' + square);
    var background = '#a9a9a9';

    if (squareEl.hasClass('black-3c85d') === true) {
        background = '#696969';
    }

    squareEl.css('background', background);
}