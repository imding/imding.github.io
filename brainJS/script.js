let net, r, g, b, bgColour, txtColour, trainData = [];

function randomColour() {
    r = Math.random();
    g = Math.random();
    b = Math.random();

    return { r, g, b };
}

function randomMatch() {
    bgColour = randomColour();
    container.style.backgroundColor = `rgb(${bgColour.r * 100}%, ${bgColour.g * 100}%, ${bgColour.b * 100}%)`;

    txtColour = randomColour();
    text.style.color = `rgb(${txtColour.r * 100}%, ${txtColour.g * 100}%, ${txtColour.b * 100}%)`;
}

window.onload = () => {
    net = new brain.NeuralNetwork();

    // fetch JSON from Firebase
    // net.fromJSON();
    
    randomMatch();

    strong.onclick = () => {
        trainData.push({input: bgColour, output: txtColour});

        net.train(trainData);
        
        randomMatch();
        demo.disabled = false;
    };

    weak.onclick = () => {
        randomMatch();
    };

    demo.onclick = () => {
        bgColour = randomColour();
        container.style.backgroundColor = `rgb(${bgColour.r * 100}%, ${bgColour.g * 100}%, ${bgColour.b * 100}%)`;
        txtColour = net.run(bgColour);
        console.log(txtColour);
        text.style.color = `rgb(${txtColour.r * 100}%, ${txtColour.g * 100}%, ${txtColour.b * 100}%)`;
    };
};

window.onkeydown = () => {
    if (event.code == "ArrowLeft") {
        strong.click();
    }
    else if (event.code == "ArrowRight") {
        weak.click();
    }
    else if (event.code == "ArrowUp") {
        demo.click();
    }
};