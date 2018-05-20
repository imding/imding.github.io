let net, r, g, b, bgColour, txtColour, strongCounter = 0, totalMatch = 0, trained = false, trainData = [];

function randomColour() {
    r = Math.random();
    g = Math.random();
    b = Math.random();

    return { r, g, b };
}

function randomCombo() {
    bgColour = randomColour();
    container.style.backgroundColor = `rgb(${bgColour.r * 100}%, ${bgColour.g * 100}%, ${bgColour.b * 100}%)`;

    txtColour = randomColour();
    text.style.color = `rgb(${txtColour.r * 100}%, ${txtColour.g * 100}%, ${txtColour.b * 100}%)`;
}

function updateText(n) {
    strongCounter += n;
    totalMatch++;
    console.log(strongCounter / totalMatch);
    info.textContent = `${Math.round((strongCounter / totalMatch) * 1000) / 10}% random chance of getting desirable match`;
}

window.onload = () => {
    net = new brain.NeuralNetwork();

    // fetch JSON from Firebase
    // net.fromJSON();
    
    randomCombo();

    strong.onclick = () => {
        trained = false;
        trainData.push({input: bgColour, output: txtColour});
        
        randomCombo();
        demo.disabled = false;

        updateText(1);
    };

    weak.onclick = () => {
        randomCombo();
        updateText(0);
    };

    demo.onclick = () => {
        bgColour = randomColour();
        container.style.backgroundColor = `rgb(${bgColour.r * 100}%, ${bgColour.g * 100}%, ${bgColour.b * 100}%)`;

        if (!trained) {
            net.train(trainData);
            trained = true;
        }

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