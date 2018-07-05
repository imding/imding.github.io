let c;

window.onload = () => {
    c = new TargetTypeChallenge();
    Object.assign(c.config, {
        speed: 0.5,
        interval: 5,
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
        prompt: 'Type the falling words EXACTLY as it\'s shown.',
    });

    c.start();
};