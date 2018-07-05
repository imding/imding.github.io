function drawLosingScreen(color) {

    clearCanvas();

    var mod = (tileCount / gridSize) * gridSize;

    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, gc.width, gc.height);

    ctx.fillStyle = color;
    ctx.fillRect(6 * mod, 3 * mod, 8 * mod, 14 * mod);

    ctx.fillStyle = 'black';
    ctx.fillRect(8 * mod, 3 * mod, 6 * mod, 12 * mod);

    // Draw the triangle tail
    ctx.beginPath();
    ctx.moveTo(13 * mod, 15 * mod);
    ctx.lineTo(14 * mod, 16 * mod);
    ctx.lineTo(14 * mod, 15 * mod);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(13 * mod, 17 * mod);
    ctx.lineTo(14 * mod, 16 * mod);
    ctx.lineTo(14 * mod, 17 * mod);
    ctx.fill();

    // Draw the eyes
    ctx.fillStyle = 'white';
    ctx.fillRect(6 * mod + 1 / 3 * mod, 3 * mod + 1 / 3 * mod, 1 / 3 * mod, 1 / 3 * mod);
    ctx.fillRect(7 * mod + 1 / 3 * mod, 3 * mod + 1 / 3 * mod, 1 / 3 * mod, 1 / 3 * mod);

    // Draw the tongue
    ctx.fillStyle = 'pink';
    ctx.fillRect(6 * mod + 5 / 6 * mod, 2.5 * mod, 1 / 3 * mod, 1 / 2 * mod);
    ctx.beginPath();
    ctx.moveTo(7 * mod, 2.5 * mod);
    ctx.lineTo(7 * mod, 2 * mod + 3 / 8 * mod);
    ctx.lineTo(6.5 * mod, 2 * mod);
    ctx.lineTo(6 * mod + 5 / 6 * mod, 2.5 * mod);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(7 * mod, 2.5 * mod);
    ctx.lineTo(7 * mod, 2 * mod + 3 / 8 * mod);
    ctx.lineTo(7.5 * mod, 2 * mod);
    ctx.lineTo(7 * mod + 1 / 6 * mod, 2.5 * mod);
    ctx.fill();

}

function drawStartingScreen() {

    clearCanvas();

    var mod = (tileCount / gridSize) * gridSize;

    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, gc.width, gc.height);

    ctx.fillStyle = 'green';
    ctx.fillRect(6 * mod, 3 * mod, 8 * mod, 14 * mod);

    ctx.fillStyle = 'black';
    ctx.fillRect(8 * mod, 5 * mod, 6 * mod, 4 * mod);
    ctx.fillRect(6 * mod, 11 * mod, 6 * mod, 4 * mod);

    // Draw the triangle tail
    ctx.beginPath();
    ctx.moveTo(7 * mod, 15 * mod);
    ctx.lineTo(6 * mod, 16 * mod);
    ctx.lineTo(6 * mod, 15 * mod);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(7 * mod, 17 * mod);
    ctx.lineTo(6 * mod, 16 * mod);
    ctx.lineTo(6 * mod, 17 * mod);
    ctx.fill();

    // Draw the eyes
    ctx.fillStyle = 'white';
    ctx.fillRect(13 * mod + 1 / 3 * mod, 3 * mod + 1 / 3 * mod, 1 / 3 * mod, 1 / 3 * mod);
    ctx.fillRect(13 * mod + 1 / 3 * mod, 4 * mod + 1 / 3 * mod, 1 / 3 * mod, 1 / 3 * mod);

    // Draw the tongue
    ctx.fillStyle = 'pink';
    ctx.fillRect(14 * mod, 3 * mod + 5 / 6 * mod, 1 / 2 * mod, 1 / 3 * mod);
    ctx.beginPath();
    ctx.moveTo(14.5 * mod, 4 * mod);
    ctx.lineTo(14 * mod + 5 / 8 * mod, 4 * mod);
    ctx.lineTo(15 * mod, 3.5 * mod);
    ctx.lineTo(14.5 * mod, 3 * mod + 5 / 6 * mod);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(14.5 * mod, 4 * mod);
    ctx.lineTo(14 * mod + 5 / 8 * mod, 4 * mod);
    ctx.lineTo(15 * mod, 4.5 * mod);
    ctx.lineTo(14.5 * mod, 4 * mod + 1 / 6 * mod);
    ctx.fill();

}