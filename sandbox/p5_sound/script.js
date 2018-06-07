var mic, fft;

// window.onload = () => {
// 	start.onclick = init;
// };

// window.onkeypress = () => {
// 	if (event.key == 'Enter') start.click();
// };

function setup() {
	createCanvas(710, 400);
	noFill();

	mic = new p5.AudioIn();
	mic.start();
	fft = new p5.FFT();
	fft.setInput(mic);
}

function draw() {
	background(200);

	var spectrum = fft.analyze();

	beginShape();
	for (i = 0; i < spectrum.length; i++) {
		vertex(i, map(spectrum[i], 0, 100, height, 0));
	}
	endShape();

	// let left = spectrum.splice(0, spectrum.length / 2);
	// let right = spectrum;

	// left = left.reduce((a, b) => { return a + b; }) / left.length;
	// right = right.reduce((a, b) => { return a + b; }) / right.length;
	// console.clear();
	// console.log(left, right);
}