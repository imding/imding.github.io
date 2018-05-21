let net, bgColour, txtColour, strongCombo = 0, totalCombo = 0, minTraining = 30, trained = false, inDemo = false, explicitTraining = false, trainingData = [];

function randomColour() {
    const r = Math.random();
    const g = Math.random();
    const b = Math.random();

    return { r, g, b };
}

function randomCombo() {
    bgColour = randomColour();
    container.style.backgroundColor = `rgb(${bgColour.r * 100}%, ${bgColour.g * 100}%, ${bgColour.b * 100}%)`;

    txtColour = randomColour();
    text.style.color = `rgb(${txtColour.r * 100}%, ${txtColour.g * 100}%, ${txtColour.b * 100}%)`;
}

function updateRatio() {
    inDemo = false;
    totalCombo++;
    info.textContent = `${Math.round((strongCombo / totalCombo) * 1000) / 10}% random chance of desirable colour combination`;
}

window.onload = () => {
    c3.textContent = minTraining;

    net = new brain.NeuralNetwork();

    // const cloudJSON = fetch JSON from Firebase
    // trainingData = JSON_to_array(cloudJSON)
    // net.fromJSON(cloudJSON)

    randomCombo();

    strong.onclick = () => {
        trained = false;
        trainingData.push({ input: bgColour, output: txtColour });
        demo.disabled = trainingData.length < minTraining;
        randomCombo();
        strongCombo++;
        updateRatio();
        c1.textContent = strongCombo;
    };

    weak.onclick = () => {
        randomCombo();
        updateRatio();
        c2.textContent = totalCombo - strongCombo;
    };

    demo.onclick = () => {
        inDemo = true;
        bgColour = randomColour();
        container.style.backgroundColor = `rgb(${bgColour.r * 100}%, ${bgColour.g * 100}%, ${bgColour.b * 100}%)`;

        if (!trained) {
            text.textContent = 'Training network...';
            if (explicitTraining) trainingData.push({ input: bgColour, output: txtColour });
            // Firebase.transaction(net.toJSON());
            net.train(trainingData);
            trained = true;
            explicitTraining = false;
            text.textContent = 'Readable Text';
        }

        txtColour = net.run(bgColour);
        text.style.color = `rgb(${txtColour.r * 100}%, ${txtColour.g * 100}%, ${txtColour.b * 100}%)`;
    };

    container.onclick = () => {
        if (inDemo) {
            txtColour = randomColour();
            text.style.color = `rgb(${txtColour.r * 100}%, ${txtColour.g * 100}%, ${txtColour.b * 100}%)`;

            trained = false;
            explicitTraining = true;
        }
    };
};

window.onkeydown = () => {
    if (event.code == 'ArrowLeft') strong.click();
    else if (event.code == 'ArrowRight') weak.click();
    else if (event.code == 'ArrowUp') demo.click();
};