let c;

window.onload = () => {
    c = new TargetTypeChallenge();
    Object.assign(c.config, {
        // speed value is the percentage of the frame height travelled per second
        speed: 0.8,
        // interval value is the amount of seconds per keystroke
        // given a value of 0.2, the game expects a player to finish typing 'hello' in one second 
        interval: 0.2,
        // list of strings that the player must type
        targets: [
            'var life = 42;',
            'function sayHello() {}',
            'var name = "John";',
            'var gameHasBegun = true;',
            'if (you\'re happy) {}',
            'return home();',
            'console.log("back to the future");',
            'while (hungry == true) {}',
            'console.log("Hello " + person.name);',
        ],
        // shuffle the target list
        shuffle: true,
        // message displayed in the top banner
        objective: 'Type the falling words EXACTLY as it\'s shown.',
    });

    c.start();
};