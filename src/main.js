var config = {
    type: Phaser.AUTO,
    scale: {
        mode: Phaser.Scale.FIT,
        parent: 'phaser-example',
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: window.innerWidth / 3,
        height: 640,
        scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH
        },
        banner: false,
    },
    pixelArt: true,
    physics: {
        default: "arcade",
        arcade: {
            debug: false
        }
    },
    scene: [Menu, Play, Over],
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
let keyESC, keySPACE;


// const resize = ()=>{
//     game.scale.resize(window.innerWidth / 3, 640)
// }

// window.addEventListener('resize', resize);
// resize();