let c;

window.onload = () => {
    c = new TypingChallenge();
    Object.assign(c.config, {
        // speed value is the percentage of the frame height travelled per second by each block
        speed: 0.2,
        // interval value is the amount of seconds per keystroke
        // given a value of 0.2, the game expects a challenger to finish typing 'hello' in one second
        interval: 2,
        // list of strings that the challenger must type
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
        // decoys: [
        //     'var 1p = 42;',
        //     'function print {}',
        // ],
        // shuffle the target list
        shuffle: true,
        // message displayed in the top banner
        // objective: 'Type what\'s right and click what\'s wrong',
        // praise: 'Well done! You scored #SCORE#/#TOTAL# points in #TIME#.',
    });

    c.start();
    c.on('complete', () => console.log(c.time));
};