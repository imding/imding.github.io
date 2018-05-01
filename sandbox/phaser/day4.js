// JavaScript using Phaser.js library
// Game Setup
var maxWidth = 800;
var gameWidth = Math.min((window.innerWidth) - 15, maxWidth);
var heightRatio = 0.55;
var gameHeight = (gameWidth * heightRatio);

var scaleRatio = gameWidth / maxWidth;

var game = new Phaser.Game(gameWidth, gameHeight, Phaser.AUTO, 'screen', {
    preload: preload,
    create: create,
    update: update,
    render: render
});
// ----------------------------------------------------------------------------------------
// Global Variables

//physics
var worldGravity = 1600;

//input
var cursors;
var jumpButton;

//sprites and groups
var player;
var background;
// var hearts;
// var enemies;
// var platform;

//movement
var moveSpeed = 120;
var jumpSpeed = -480;
var inAir;

// var velocityX;
// var velocityY;
// var velocityDir;

//combat
// var health = 3;
// var hearts = [];
// var damageTime = 2000;
// var _damageTime = 0;
// var enemyMove = 100;

//score
// var score = 0;
// var scoreText;
// var winText;

// ----------------------------------------------------------------------------------------

// Loads assets before starting the game

function preload() {
    game.load.crossOrigin = 'anonymous'; // REQUIRED for loading external assets
    game.load.baseURL = 'http://examples.phaser.io/assets/'; // OPTIONAL for accessing phaser assets

    //  37x45 is the size of each frame
    //  There are 18 frames in the PNG
    game.load.spritesheet('mummy', 'sprites/metalslug_mummy37x45.png', 37, 45, 18);

    // Load player image
    game.load.image('player', 'http://examples.phaser.io/assets/sprites/phaser-dude.png');

    // game.load.image('heart', 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/Heart_coraz%C3%B3n.svg/220px-Heart_coraz%C3%B3n.svg.png');

    // Load background image
    game.load.image('background', 'https://wallpapers.wallhaven.cc/wallpapers/full/wallhaven-496295.png');

    // Load platform image
    // game.load.image('platform', 'http://examples.phaser.io/assets/sprites/block.png');

    // Load coin sprite sheet (has animation)
    game.load.spritesheet('coin', 'http://examples.phaser.io/assets/sprites/coin.png', 32, 32);

    // Load enemy sprite sheet
    // game.load.spritesheet('enemy', 'http://examples.phaser.io/assets/sprites/baddie_cat_1.png', 16, 16);
}
// ----------------------------------------------------------------------------------------

// Creates game objects before starting the game

function create() {
    game.world.setBounds(0, 0, game.width, game.height - 20);

    // Create physics and control input
    createInput();

    // Add in background
    createBackground();

    // Add in our game text
    // createText();

    // Add in our players health hearts
    // createHearts();

    // Add platform sprite at x, y position
    // createPlatform();

    // Add coin sprite and animation
    coins = game.add.group();
    createCoins(game.world.centerX, game.world.centerY);

    // Add enemy sprite and set his animation
    // enemies = game.add.group();
    // createEnemies();

    // Add player sprite at x, y position
    createPlayer();
}
// ----------------------------------------------------------------------------------------

// Runs every frame

function update() {
    // Set up collisions
    updateCollisions();

    // Functions to run
    // enemies.forEach(moveEnemy);

    playerXMovement();
    playerYMovement();
}
// ----------------------------------------------------------------------------------------

// Creates any after effects

function render() {
    // game.debug.body(player);
    // game.debug.body(platform);
}
// ----------------------------------------------------------------------------------------

// Create other functions here

function createInput() {
    game.physics.startSystem(Phaser.Physics.Arcade); // Starts the physics system

    cursors = game.input.keyboard.createCursorKeys();
    jumpButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
}

function createBackground() {
    background = game.add.sprite(0, 0, 'background');

    background.width = game.width;
    background.height = game.height;
}

// function createText() {
//     scoreText = game.add.text(0, 0, 'Score: ' + score);
// }

// function createHearts() {
//     var heart;

//     for (var i = 0; i < 3; i++) {
//         heart = game.add.sprite(game.world.centerX + 30 * i, 0, 'heart');

//         heart.scale.setTo(0.15 * scaleRatio, 0.15 * scaleRatio);

//         hearts.push(heart);
//     }
// }

// function createPlatform() {
//     platform = game.add.sprite(game.world.centerX, game.world.centerY + 100 * scaleRatio, 'platform');
//     platform.anchor.setTo(0.5, 0.5);
//     platform.scale.setTo(2 * scaleRatio, 0.25 * scaleRatio);

//     game.physics.enable(platform, Phaser.Physics.ARCADE);

//     platform.body.immovable = true;

//     platform.body.checkCollision.left = false;
//     platform.body.checkCollision.right = false;
//     platform.body.checkCollision.down = false;
// }

function createCoins(x, y) {
    var coin;
    for (var i = 0; i < 2; i++) {
        coin = coins.create(x + (50 * i * scaleRatio), y, 'coin');

        coin.anchor.setTo(0.5, 0.5);
        coin.scale.setTo(1 * scaleRatio, 1 * scaleRatio);

        game.physics.enable(coin, Phaser.Physics.ARCADE);

        coin.body.collideWorldBounds = true;

        coin.body.gravity.y = worldGravity;
        coin.body.bounce.y = 0.2;

        coin.animations.add('spin');
        coin.animations.play('spin', 6, true);
    }
}

// function createEnemies() {
//     var enemy;
//     for (var i = 0; i < 3; i++) {
//         enemy = enemies.create(Math.random() * game.width, game.height, 'enemy');

//         enemy.scale.setTo(1.5 * scaleRatio, 1.5 * scaleRatio);
//         enemy.anchor.setTo(0.5, 0.5);

//         game.physics.enable(enemy, Phaser.Physics.ARCADE);
//         enemy.body.gravity.y = worldGravity;
//         enemy.body.collideWorldBounds = true;

//         enemy.animations.add('walkLeft', [0, 1]);
//         enemy.animations.add('walkRight', [2, 3]);

//         enemy.dir = -1;

//         if (enemy.dir == 1) {
//             enemy.animations.play('walkRight', 4, true);
//         } else {
//             enemy.animations.play('walkLeft', 4, true);
//         }

//         enemy.body.velocity.x = enemyMove * enemy.dir;
//     }
// }

function createPlayer() {
    player = game.add.sprite(game.world.centerX - 100, game.world.centerY - 100, 'mummy'); // Add in sprite
    player.scale.setTo(1 * scaleRatio, 1 * scaleRatio); // Change x and y size of sprite
    player.anchor.setTo(0.5, 0.5);
    game.physics.enable(player, Phaser.Physics.ARCADE); // Enable player physics
    player.body.collideWorldBounds = true; // Keep player inside the screen
    player.body.gravity.y = worldGravity; // Set the player gravity

    player.dir = 1;
    // damageFlickerTween = game.add.tween(player);
    // damageFlickerTween.to({ alpha: 0 }, 80, Phaser.Easing.Linear.None, false, 0, 9, true);
}

function collectCoin(player, coin) {
    // score += 100;
    // scoreText.text = 'Score: ' + score;
    coin.kill();
}

// function enemyBattle(player, enemy) {
//     if (player.body.touching.down && enemy.body.touching.up) {

//         player.body.velocity.y = jumpSpeed * 0.75;

//         createCoins(enemy.x, enemy.y);
//         // createEnemies();

//         enemy.kill();
//     }
//     else if (game.time.now >= _damageTime) {
//         reduceHealth();
//     }
// }

// function reduceHealth() {
//     health--;
//     if (hearts[health]) {
//         hearts[health].kill();
//     }
//     _damageTime = game.time.now + damageTime;
//     damageFlickerTween.start();

//     if (health <= 0) {
//         player.kill();
//     }
// }

// function moveEnemy(enemy) {
//     if (enemy.body.onWall() || enemy.body.touching.left || enemy.body.touching.right) {
//         flipEnemy(enemy);
//     }

//     enemy.body.velocity.x = enemyMove * enemy.dir;
// }

// function flipEnemy(enemy) {
//     enemy.dir *= -1;
//     //enemy.scale.x *= -1;

//     if (enemy.dir == 1) {
//         enemy.animations.play('walkRight', 4, true);
//     } else {
//         enemy.animations.play('walkLeft', 4, true);
//     }
// }

function updateCollisions() {
    // game.physics.arcade.collide(player, platform);
    // game.physics.arcade.collide(player, enemies, enemyBattle);

    // game.physics.arcade.collide(coins, platform);
    game.physics.arcade.overlap(player, coins, collectCoin);
}

function playerXMovement() {
    inAir = !player.body.touching.down && !player.body.onFloor();

    if (inAir) {
        player.animations.frame = 8;
    }
    else {
        player.body.velocity.x = 0;

        if (cursors.right.isDown) {
            if (player.scale.x < 0) player.scale.x = 1;
            player.animations.frame += 1;
            player.body.velocity.x = moveSpeed;
        }
        else if (cursors.left.isDown) {
            if (player.scale.x > 0) player.scale.x = -1;
            player.animations.frame += 1;
            player.body.velocity.x = -moveSpeed;
        }
        else {
            player.animations.stop();
        }
    }
}

var allowJump = true;
var jump = 0;

function playerYMovement() {
    inAir = !player.body.touching.down && !player.body.onFloor();
    jump = inAir ? jump : 0;

    if (allowJump && jumpButton.isDown) {
        if (!inAir || jump) {
            player.body.velocity.y = jumpSpeed;
            jump = jump < 1 ? jump + 1 : 0;
            allowJump = false;
        }
    }
    else {
        allowJump = jumpButton.isUp;
    }
}