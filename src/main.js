var config = {
    type: Phaser.AUTO,
    scale: {
        mode: Phaser.Scale.FIT,
        parent: 'phaser-example',
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 1920,
        height: 1080
    },
    physics: {
        default: "arcade",
        arcade: {
            debug: false
        }
    },
    scene: [Menu, Play],
    callbacks: {
        postBoot: function (game) {
          // In v3.15, you have to override Phaser's default styles
          game.canvas.style.width = '100%';
          game.canvas.style.height = '100%';
        }
    }
};

let game = new Phaser.Game(config);

// code adapted from http://ex-artist.com/CMPM120/Tutorials/Phaser%203%20Rocket%20Patrol%20Tutorial.html
// set UI sizes
let borderUISize = game.config.height / 15;
let borderPadding = borderUISize / 3;

// reserve keyboard vars
let keyF, keyR, keyM, keyLEFT, keyRIGHT;