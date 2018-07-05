let c;

window.onload = () => {
    c = new TargetTypeChallenge();
    c.config.speed = 0.2;
    c.config.targets = ['var n = 42;', 'function sayHello() {}'];
    c.start();
};